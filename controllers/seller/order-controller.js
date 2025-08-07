const Order = require("../../models/Order");
const User = require("../../models/User");
const sendNotification = require("../../helpers/fcm");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada pesanan yang ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Terjadi Kesalahan!",
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

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan Tidak ditemukan!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    const user = await User.findById(order.userId);

    if (user?.fcmToken) {
      try {
        await sendNotification(user.fcmToken, {
          title: "Status Pesanan",
          body: `Hai! Pesanan kamu sekarang: ${orderStatus}`,
          data: {
            orderId: id,
            type: "ORDER_UPDATE",
          },
        });
      } catch (notificationErr) {
        console.error("Notifikasi gagal:", notificationErr.message);
        // Biarkan jalan terus tanpa return error
      }
    }

    return res.status(200).json({
      success: true,
      message: "Status pesanan berhasil diperbarui!",
    });

  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Terjadi Kesalahan!",
    });
  }
};




module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForSeller,
  updateOrderStatus,
};
