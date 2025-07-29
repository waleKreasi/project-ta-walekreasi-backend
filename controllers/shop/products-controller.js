const Product = require("../../models/Product");
const Seller = require("../../models/Seller");

// Tambahkan produk baru
const createProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      price,
      salePrice,
      totalStock,
      sellerId,
    } = req.body;

    // Validasi seller
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller tidak ditemukan." });
    }

    // Buat produk
    const product = new Product({
      image,
      title,
      description,
      category,
      price,
      salePrice,
      totalStock,
      sellerId: seller._id, 
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan.",
      data: product,
    });
  } catch (error) {
    console.error("Error createProduct:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat menambahkan produk." });
  }
};

// Ambil semua produk dengan filter dan sort
const getFilteredProducts = async (req, res) => {
  try {
    const {
      category = "",
      sortBy = "price-lowtohigh",
      limit, // ✅ ambil limit dari query string
    } = req.query;

    let filters = {};
    if (typeof category === "string" && category.trim() !== "") {
      filters.category = { $in: category.split(",") };
    }

    // Sort logic
    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      case "newest":
        sort.createdAt = -1;
        break;
      default:
        sort.price = 1;
    }
    

    // ✅ Apply limit jika ada
    const query = Product.find(filters).sort(sort).populate("sellerId", "storeName storeLogoUrl");

    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        query.limit(limitNum);
      }
    }

    const products = await query;

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error in getFilteredProducts:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil produk." });
  }
};

// Ambil detail produk
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate("sellerId", "storeName storeLogoUrl");

    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: product._id,
        title: product.title,
        description: product.description,
        image: product.image,
        price: product.price,
        salePrice: product.salePrice,
        category: product.category,
        totalStock: product.totalStock,
        averageReview: product.averageReview,
        storeName: product.sellerId?.storeName || null,
        storeLogoUrl: product.sellerId?.storeLogoUrl || null,
        sellerId: product.sellerId?._id || null,
      },
    });
  } catch (error) {
    console.error("Error getProductDetails:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil detail produk." });
  }
};

module.exports = {
  createProduct,
  getFilteredProducts,
  getProductDetails,
};
