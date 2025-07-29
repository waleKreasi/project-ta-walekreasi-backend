const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");
const Seller = require("../../models/Seller");

// Upload gambar
const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({ success: true, result });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat upload gambar" });
  }
};

// Tambah produk baru
const addProduct = async (req, res) => {
  const {
    image,
    title,
    description,
    category,
    price,
    salePrice,
    totalStock,
    averageReview = 0,
  } = req.body;

  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, message: "Toko tidak ditemukan." });
    }

    const product = new Product({
      image,
      title,
      description,
      category,
      price,
      salePrice,
      totalStock,
      averageReview,
      sellerId: seller._id,
    });

    await product.save();
    res.status(201).json({
      success: true,
      message: "Produk berhasil ditambahkan",
      product,
    });
  } catch (error) {
    console.error("Gagal menambahkan produk:", error);
    res.status(500).json({ success: false, message: "Gagal menambahkan produk" });
  }
};

// Ambil semua produk milik seller
const fetchAllProducts = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, message: "Toko tidak ditemukan." });
    }

    const listOfProducts = await Product.find({ sellerId: seller._id });
    res.status(200).json({ success: true, data: listOfProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengambil produk" });
  }
};

// Edit produk
const editProduct = async (req, res) => {
  const { id } = req.params;
  const {
    image,
    title,
    description,
    category,
    brand,
    price,
    salePrice,
    totalStock,
    averageReview,
  } = req.body;

  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, message: "Toko tidak ditemukan." });
    }

    const findProduct = await Product.findOne({ _id: id, sellerId: seller._id });
    if (!findProduct) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan atau tidak dimiliki oleh Anda." });
    }

    findProduct.image = image ?? findProduct.image;
    findProduct.title = title ?? findProduct.title;
    findProduct.description = description ?? findProduct.description;
    findProduct.category = category ?? findProduct.category;
    findProduct.price = price === "" ? 0 : price ?? findProduct.price;
    findProduct.salePrice = salePrice === "" ? 0 : salePrice ?? findProduct.salePrice;
    findProduct.totalStock = totalStock ?? findProduct.totalStock;
    findProduct.averageReview = averageReview ?? findProduct.averageReview;

    await findProduct.save();
    res.status(200).json({ success: true, data: findProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengedit produk" });
  }
};

// Hapus produk
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, message: "Toko tidak ditemukan." });
    }

    const product = await Product.findOneAndDelete({ _id: id, sellerId: seller._id });
    if (!product) {
      return res.status(404).json({ success: false, message: "Produk tidak ditemukan." });
    }

    res.status(200).json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat menghapus produk" });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
