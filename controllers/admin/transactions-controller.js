const Order = require("../../models/Order");
const Seller = require("../../models/Seller");
const User = require("../../models/User");

const getAllTransactions = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ orderDate: -1 })
      .populate("sellerId", "storeName email") 
      .lean();


    const allUsers = await User.find({}, "_id userName email").lean();


    const ordersWithCustomer = orders.map(order => {
      const customer = allUsers.find(user => user._id.toString() === order.userId);
      return {
        ...order,
        customerName: customer?.userName || "Tidak ditemukan",
        customerEmail: customer?.email || "-",
      };
    });

    res.status(200).json({
      success: true,
      message: "Daftar transaksi berhasil diambil",
      data: ordersWithCustomer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil transaksi",
      error: err.message,
    });
  }
};


const getTransactionById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("sellerId", "storeName email")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Transaksi tidak ditemukan" });
    }

    const customer = await User.findById(order.userId).lean();

    res.status(200).json({
      success: true,
      message: "Detail transaksi berhasil diambil",
      data: {
        ...order,
        customerName: customer?.userName || "Tidak ditemukan",
        customerEmail: customer?.email || "-",
      },
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