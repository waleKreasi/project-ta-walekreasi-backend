const Seller = require("../models/seller-model");
const SellerPayoutHistory = require("../models/sellerPayoutHistory-model");

const getSellerPayouts = async (req, res) => {
  try {
    let sellerId = req.user?.sellerId; // ambil dari JWT kalau ada

    // Kalau sellerId belum ada di JWT, fallback cari dari DB
    if (!sellerId) {
      const seller = await Seller.findOne({ user: req.user.id });
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: "Seller tidak ditemukan",
        });
      }
      sellerId = seller._id;
    }

    // Cari payout berdasarkan sellerId
    const payouts = await SellerPayoutHistory.find({ sellerId })
      .populate("orders", "orderId totalAmount status createdAt") // populate info order
      .populate("sellerId", "storeName user"); // populate info seller

    if (!payouts || payouts.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Belum ada riwayat payout untuk seller ini",
        payouts: [],
      });
    }

    return res.status(200).json({
      success: true,
      payouts,
    });
  } catch (error) {
    console.error("Error getSellerPayouts:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil riwayat payout",
      error: error.message,
    });
  }
};

module.exports = { getSellerPayouts };
