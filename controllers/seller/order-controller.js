const Order = require("../../models/Order");
const { sendNotificationToCustomerByOrderStatus } = require("../common/notification-controller");
const mongoose = require("mongoose"); 


const getOrdersForSeller =async (req, res) => {
  try {
    const { sellerId } = req.params;
    const objectId = new mongoose.Types.ObjectId(sellerId);

    const orders = await Order.find({ "cartItems.sellerId": objectId })
      .populate("userId", "name email")
      .populate("cartItems.productId", "name price images") 
      .lean();

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "Belum ada pesanan untuk toko ini.",
      });
    }

    const filteredOrders = orders.map((order) => {
      const sellerItems = order.cartItems.filter(
        (item) => item.sellerId.toString() === sellerId
      );
      return {
        ...order,
        cartItems: sellerItems,
      };
    });

    res.status(200).json({
      success: true,
      data: filteredOrders,
    });
  } catch (err) {
    console.error("Fetch seller orders error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pesanan seller.",
    });
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
  getOrdersForSeller,
  getOrderDetailsForSeller,
  updateOrderStatus,
};
