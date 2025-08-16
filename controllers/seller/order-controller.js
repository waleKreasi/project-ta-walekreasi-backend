const Order = require("../../models/Order");
const Seller = require("../../models/Seller");
const { sendNotificationToCustomerByOrderStatus } = require("../common/notification-controller");
const mongoose = require("mongoose"); 


// Ambil semua order milik seller
const getOrdersBySeller = async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({ success: false, message: "Toko tidak ditemukan." });
    }

    const listOfOrders = await Order.find({ sellerId: seller._id });
    res.status(200).json({ success: true, data: listOfOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat mengambil produk" });
  }
};


const getOrderDetailsForSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("userId", "userName phoneNumber");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan Tidak ditemukan!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Terjadi Kesalahan!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'rejected'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status pesanan tidak valid!",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "ID pesanan tidak valid!",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    // ✅ Kirim notifikasi dengan _id yang sudah pasti valid
    await sendNotificationToCustomerByOrderStatus(order._id, orderStatus);

    return res.status(200).json({
      success: true,
      message: "Status pesanan berhasil diperbarui!",
    });

  } catch (e) {
    console.error("❌ updateOrderStatus error:", e.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi Kesalahan!",
    });
  }
};




module.exports = {
  getOrdersBySeller,
  getOrderDetailsForSeller,
  updateOrderStatus,
};
