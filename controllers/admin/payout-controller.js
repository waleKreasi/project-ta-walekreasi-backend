const Order = require("../../models/Order");
const SellerPayoutHistory = require("../../models/Payout");
const User = require("../../models/User"); 

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
    for (let order of orders) {
      const seller = order.sellerId;
      if (!seller) continue;

      const sellerId = seller._id.toString();
      if (!grouped[sellerId]) {
        grouped[sellerId] = {
          sellerId: sellerId,
          sellerName: seller.storeName || 'Nama Seller Tidak Diketahui',
          totalUnpaidOrders: 0,
          totalAmount: 0,
        };
      }
      grouped[sellerId].totalUnpaidOrders += 1;
      grouped[sellerId].totalAmount += order.totalAmount;
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

    const orders = await Order.find({
      sellerId: sellerId,
      paymentStatus: "Terbayar",
      isPaidToSeller: false,
    }).populate("sellerId", "storeName");

    if (!orders || orders.length === 0) {
      const seller = await User.findById(sellerId, 'storeName'); // Cari nama seller meski tidak ada pesanan
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

// Endpoint 3: Menandai pesanan telah dibayar ke seller
const markOrdersPaidToSeller = async (req, res) => {
  try {
    const { sellerId, orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Pilih setidaknya satu pesanan untuk dibayar.",
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

module.exports = {
  getUnpaidSellersForPayout,
  getUnpaidOrdersBySellerId,
  markOrdersPaidToSeller,
  getPayoutHistoryBySeller,
};