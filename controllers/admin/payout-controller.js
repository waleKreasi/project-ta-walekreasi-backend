const Order = require("../../models/Order");
const SellerPayoutHistory = require("../../models/Payout");
const User = require("../../models/User");
const { imageUploadUtil } = require("../../helpers/cloudinary"); // Mengimpor helper yang Anda buat

// Endpoint 1: Mendapatkan daftar ringkasan seller yang perlu dibayar
const getUnpaidSellersForPayout = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentStatus: "Terbayar",
      isPaidToSeller: false,
    }).populate("sellerId", "storeName");

    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const grouped = {};
    for (const order of orders) {
      const seller = order.sellerId;
      if (!seller || !seller._id) {
        console.warn("Pesanan ditemukan tanpa ID seller:", order._id);
        continue;
      }

      const sellerId = seller._id.toString();
      const sellerName = seller.storeName || 'Nama Toko Tidak Diketahui';
      
      if (!grouped[sellerId]) {
        grouped[sellerId] = {
          sellerId: sellerId,
          sellerName: sellerName,
          totalUnpaidOrders: 0,
          totalAmount: 0,
          orders: [],
        };
      }
      grouped[sellerId].totalUnpaidOrders += 1;
      grouped[sellerId].totalAmount += order.totalAmount;
      grouped[sellerId].orders.push(order._id);
    }

    const result = Object.values(grouped);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error fetching unpaid sellers:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data seller." });
  }
};

// Endpoint 2: Mendapatkan detail pesanan yang belum dibayar untuk seller tertentu
const getUnpaidOrdersBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId || sellerId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: "ID Seller tidak valid atau tidak ditemukan."
      });
    }

    const orders = await Order.find({
      sellerId: sellerId,
      paymentStatus: "Terbayar",
      isPaidToSeller: false,
    }).populate("sellerId", "storeName");

    if (!orders || orders.length === 0) {
      const seller = await User.findById(sellerId, 'storeName');
      const sellerName = seller ? seller.storeName : 'Seller Tidak Ditemukan';
      return res.status(200).json({ success: true, data: { sellerName, orders: [] } });
    }
    
    const sellerName = orders[0].sellerId.storeName;
    res.status(200).json({ success: true, data: { sellerName, orders } });
  } catch (err) {
    console.error("Error fetching unpaid orders by seller:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data pesanan." });
  }
};

// Endpoint 3: Menandai pesanan telah dibayar ke seller, sekarang dengan upload file
const markOrdersPaidToSeller = async (req, res) => {
  try {
    const { sellerId, orderIds } = req.body;
    const paymentProofFile = req.file; // File diakses dari middleware Multer

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Pilih setidaknya satu pesanan untuk dibayar.",
      });
    }

    if (!paymentProofFile) {
        return res.status(400).json({
            success: false,
            message: "Bukti pembayaran harus diunggah.",
        });
    }

    const orders = await Order.find({
      _id: { $in: orderIds },
      sellerId: sellerId,
      paymentStatus: "Terbayar",
      isPaidToSeller: false,
    });

    if (orders.length !== orderIds.length) {
      return res.status(400).json({
        success: false,
        message: "Beberapa pesanan tidak valid atau sudah dibayar.",
      });
    }

    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    let paymentProofUrl = null;

    // Unggah file ke Cloudinary menggunakan helper yang Anda buat
    try {
        // Karena Anda menggunakan multer.memoryStorage(), file ada di req.file.buffer
        // Anda perlu mengonversi buffer menjadi base64 string untuk diunggah
        const base64File = `data:${paymentProofFile.mimetype};base64,${paymentProofFile.buffer.toString('base64')}`;
        const result = await imageUploadUtil(base64File);
        paymentProofUrl = result.secure_url;
    } catch (uploadError) {
        console.error("Gagal mengunggah bukti pembayaran:", uploadError);
        return res.status(500).json({ success: false, message: "Gagal mengunggah bukti pembayaran." });
    }

    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        isPaidToSeller: true,
        paidToSellerAt: new Date(),
      }
    );

    const history = new SellerPayoutHistory({
      sellerId,
      orders: orderIds,
      amount: totalAmount,
      paidAt: new Date(),
      paymentProofUrl, // Simpan URL bukti pembayaran
    });
    await history.save();

    res.status(200).json({
      success: true,
      message: "Pembayaran ke seller berhasil ditandai.",
      data: history,
    });
  } catch (err) {
    console.error("Error marking payout:", err);
    res.status(500).json({ success: false, message: "Gagal memproses pembayaran ke seller." });
  }
};

// Endpoint 4: Mendapatkan riwayat pembayaran ke seller tertentu
const getPayoutHistoryBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const histories = await SellerPayoutHistory.find({ sellerId })
      .populate("orders", "totalAmount orderDate orderStatus paymentStatus")
      .sort({ paidAt: -1 });

    res.status(200).json({
      success: true,
      data: histories,
    });
  } catch (err) {
    console.error("Error fetching payout history:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil riwayat pembayaran." });
  }
};

// Endpoint BARU: Mendapatkan SEMUA riwayat pembayaran untuk semua seller
const getAllPayoutHistory = async (req, res) => {
  try {
    const histories = await SellerPayoutHistory.find({})
      .populate("sellerId", "storeName")
      .sort({ paidAt: -1 });

    // Periksa dan konversi paidAt jika diperlukan
    const formattedHistories = histories.map(history => {
        // Jika paidAt adalah objek BSON, konversi ke JavaScript Date
        const paidAtDate = history.paidAt && history.paidAt.$date
            ? new Date(parseInt(history.paidAt.$date.$numberLong))
            : history.paidAt;

        return {
            ...history.toObject(), // Pastikan objek dapat diubah
            paidAt: paidAtDate
        };
    });

    res.status(200).json({
      success: true,
      data: formattedHistories,
    });
  } catch (err) {
    console.error("Error fetching all payout history:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil semua riwayat pembayaran." });
  }
};

module.exports = {
  getUnpaidSellersForPayout,
  getUnpaidOrdersBySellerId,
  markOrdersPaidToSeller,
  getPayoutHistoryBySeller,
  getAllPayoutHistory, // Pastikan fungsi ini diekspor
};
