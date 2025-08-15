const Payout = require("../../models/Payout"); 
const Order = require("../../models/Order"); 

// Ambil daftar pembayaran untuk seller yang sedang login
const getSellerPayouts = async (req, res) => {
  try {
    const sellerId = req.user.id; // dari middleware auth

    // Ambil semua payout yang terkait seller
    const payouts = await Payout.find({ sellerId })
      .populate({
        path: "orders",
        select: "orderId totalPrice paymentStatus payoutStatus",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payouts,
    });
  } catch (error) {
    console.error("Error getSellerPayouts:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data pembayaran seller",
    });
  }
};

module.exports = {
  getSellerPayouts,
};
