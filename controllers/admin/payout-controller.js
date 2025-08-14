const Order = require("../../models/Order");
const SellerPayoutHistory = require("../../models/Payout");

// Mendapatkan pesanan yang sudah dibayar customer tetapi belum dibayarkan ke seller
const getUnpaidOrdersBySeller = async (req, res) => {
  try {
    // 1. Cari pesanan yang sudah terbayar namun belum dibayarkan ke seller
    const orders = await Order.find({
      paymentStatus: "Terbayar",
      isPaidToSeller: false,
    }).populate("sellerId", "storeName"); // Mengambil nama toko seller

    // Jika tidak ada pesanan, kirim respons kosong
    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, data: {} });
    }

    // 2. Kelompokkan pesanan berdasarkan seller
    const grouped = {};
    for (let order of orders) {
      const seller = order.sellerId;
      if (!seller) continue; // Lewati jika data seller tidak ditemukan

      const sellerId = seller._id.toString();
      const sellerName = seller.storeName || 'Nama Seller Tidak Diketahui';

      if (!grouped[sellerId]) {
        grouped[sellerId] = {
          sellerName: sellerName,
          orders: [],
        };
      }
      grouped[sellerId].orders.push(order);
    }

    res.status(200).json({ success: true, data: grouped });
  } catch (err) {
    console.error("Error grouping orders:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data pesanan." });
  }
};

// Menandai pesanan telah dibayar ke seller
const markOrdersPaidToSeller = async (req, res) => {
  try {
    const { sellerId, orderIds } = req.body;

    // 1. Validasi input: pastikan orderIds adalah array yang tidak kosong
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Pilih setidaknya satu pesanan untuk dibayar.",
      });
    }

    // 2. Cari pesanan yang dipilih dan pastikan statusnya valid
    const orders = await Order.find({
      _id: { $in: orderIds },
      sellerId: sellerId,
      paymentStatus: "Terbayar",
      isPaidToSeller: false,
    });

    // Validasi: pastikan semua ID pesanan yang diberikan ditemukan dan valid
    if (orders.length !== orderIds.length) {
      return res.status(400).json({
        success: false,
        message: "Beberapa pesanan tidak valid atau sudah dibayar.",
      });
    }

    // 3. Hitung total jumlah dari pesanan yang dipilih
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 4. Perbarui status pesanan menjadi sudah dibayar ke seller
    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        isPaidToSeller: true,
        paidToSellerAt: new Date(),
      }
    );

    // 5. Simpan riwayat pembayaran (payout)
    const history = new SellerPayoutHistory({
      sellerId,
      orders: orderIds,
      amount: totalAmount,
      paidAt: new Date(), // Tambahkan field paidAt pada history
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

// Mendapatkan riwayat pembayaran ke seller tertentu
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

module.exports = {
  getUnpaidOrdersBySeller,
  markOrdersPaidToSeller,
  getPayoutHistoryBySeller,
};