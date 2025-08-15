const Order = require("../../models/Order");
const Seller = require("../../models/Seller");
const User = require("../../models/User");

// Fungsi untuk mengambil semua transaksi
const getAllTransactions = async (req, res) => {
  try {
    // Menggunakan populate untuk mengambil data customer dan seller secara langsung
    const orders = await Order.find()
      .sort({ orderDate: -1 })
      .populate("sellerId", "storeName email") // Mengambil storeName dan email dari model Seller
      .populate("userId", "userName email") // Mengambil userName dan email dari model User
      .lean();

    res.status(200).json({
      success: true,
      message: "Daftar transaksi berhasil diambil",
      data: orders,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil transaksi",
      error: err.message,
    });
  }
};

// Fungsi untuk mengambil transaksi berdasarkan ID
const getTransactionById = async (req, res) => {
  try {
    // Menggunakan populate untuk mengambil data customer dan seller
    const order = await Order.findById(req.params.id)
      .populate("sellerId", "storeName email")
      .populate("userId", "userName email")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    res.status(200).json({
      success: true,
      message: "Detail transaksi berhasil diambil",
      data: order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail transaksi",
      error: err.message,
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
};
