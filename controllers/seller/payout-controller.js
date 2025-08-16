const Seller = require("../../models/Seller");
const SellerPayoutHistory = require("../../models/Payout");

// Ambil semua payout milik seller
const getPayoutsBySeller = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) { 
      return res.status(404).json({ success: false, message: "Toko tidak ditemukan." });
    }
    const listOfPayouts = await SellerPayoutHistory.find({ sellerId: seller._id })
    res.status(200).json({success: true,data: listOfPayouts,});
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengambil data payout" });
  }
};

module.exports = { getPayoutsBySeller };
