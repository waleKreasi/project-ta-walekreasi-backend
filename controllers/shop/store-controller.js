const Seller = require("../../models/Seller");
const Product = require("../../models/Product");

// GET /api/store/:sellerId
const getStoreBySellerId = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;

    // 1. Ambil data seller berdasarkan ID
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Toko tidak ditemukan." });
    }

    // 2. Ambil semua produk milik seller
    const products = await Product.find({ sellerId: sellerId });

    // 3. Kirim data response JSON
    res.status(200).json({
      sellerId: seller._id,
      storeName: seller.storeName,
      storeLogoUrl: seller.storeLogoUrl,
      storeBannerUrl: seller.storeBannerUrl,
      storeDescription: seller.storeDescription,
      productionAddress: seller.productionAddress,
      phoneNumber: seller.phoneNumber,
      products: products.map((product) => ({
        _id: product._id,
        title: product.title,
        description: product.description,
        image: product.image,
        price: product.price,
        salePrice: product.salePrice,
        category: product.category,
        totalStock: product.totalStock,
        averageReview: product.averageReview,
      })),
    });
  } catch (error) {
    console.error("Error saat mengambil data toko:", error.message);
    res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
};

module.exports = {
  getStoreBySellerId,
};
