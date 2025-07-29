const Order = require("../../models/Order");
const SellerPayoutHistory = require("../../models/Payout");

// Mendapatkan pesanan yang sudah dibayar customer tetapi belum dibayarkan ke seller
const getUnpaidOrdersBySeller = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentStatus: "Terbayar",
      isPaidToSeller: false,
    });

    // Kelompokkan berdasarkan sellerId dari level atas (bukan cartItems)
    const grouped = {};

    for (let order of orders) {
      const sellerId = order.sellerId?.toString();
      if (!grouped[sellerId]) grouped[sellerId] = [];
      grouped[sellerId].push(order);
    }

    res.status(200).json({ success: true, data: grouped });
  } catch (err) {
    console.error("Error grouping orders:", err);
    res.status(500).json({ success: false, message: "Gagal mengambil data pesanan." });
  }
};

// Menandai pesanan telah dibayar ke seller dan menyimpan ke riwayat pembayaran
const markOrdersPaidToSeller = async (req, res) => {
  try {
    const { sellerId } = req.body;

    const orders = await Order.find({
      sellerId,
      paymentStatus: "Terbayar",
      isPaidToSeller: false,
    });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada pesanan yang perlu dibayar ke seller ini.",
      });
    }

    const orderIds = orders.map((order) => order._id);
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Tandai pesanan sebagai sudah dibayar ke seller
    await Order.updateMany(
      { _id: { $in: orderIds } },
      {
        isPaidToSeller: true,
        paidToSellerAt: new Date(),
      }
    );

    // Simpan ke riwayat payout
    const history = new SellerPayoutHistory({
      sellerId,
      orders: orderIds,
      amount: totalAmount,
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
      .populate("orders", "totalAmount orderDate orderStatus paymentStatus") // optional
      .sort({ paidAt: -1 }); // urut terbaru

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
