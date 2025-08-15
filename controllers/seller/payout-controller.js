const Payout = require("../../models/Payout");
const Seller = require("../../models/Seller");

/**
 * Ambil daftar pembayaran (payout) untuk seller yang sedang login
 * Hanya menampilkan payout yang sudah dibuat admin untuk order selesai
 */
const getSellerPayouts = async (req, res) => {
  try {
    let sellerId = req.user?.sellerId; // gunakan jika sellerId disimpan di JWT

    // Kalau sellerId belum ada di JWT, cari dari DB berdasarkan user ID
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

    // Ambil semua payout milik seller, urutkan dari terbaru
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
