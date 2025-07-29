const Seller = require("../../models/Seller");

// Ambil data seller berdasarkan ID, exclude logo, banner, dan deskripsi
const getSellerById = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const seller = await Seller.findById(sellerId).select(
      "-storeLogoUrl -storeBannerUrl -storeDescription"
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Detail seller berhasil diambil",
      data: seller,
    });
  } catch (error) {
    console.error("Gagal mengambil detail seller:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

const getAllSellers = async (req, res) => {
  try {
    const sellers = await Seller.find().select(
      "-storeLogoUrl -storeBannerUrl -storeDescription"
    );

    res.status(200).json({
      success: true,
      data: sellers,
    });
  } catch (error) {
    console.error("Gagal mengambil semua seller:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data seller.",
    });
  }
};


module.exports = {
  getSellerById,
  getAllSellers
};
