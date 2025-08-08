const admin = require("firebase-admin");
const Order = require("../../models/Order");
const User = require("../../models/User");

const sendNotificationToCustomerByOrderStatus = async (orderId, status) => {
  try {
    console.log("✅ Running sendNotificationToCustomerByOrderStatus");

    const order = await Order.findById(orderId).populate("userId");
    if (!order || !order.userId) {
      console.log("❌ Order or user not found");
      return;
    }

    const fcmToken = order.userId.fcmToken;
    if (!fcmToken) {
      console.log("❌ FCM token not available for user");
      return;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: "Status Pesanan Diperbarui",
        body: `Pesanan Anda sekarang berstatus ${status}`,
      },
      data: {
        orderId: orderId.toString(),
        status: status,
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Notifikasi berhasil dikirim:", response);
  } catch (error) {
    console.error("❌ Gagal mengirim notifikasi:", error.message);
  }
};

// ✅ handler POST /save-token
const sendNotificationHandler = async (req, res) => {
  try {
    const userId = req.user.id; // dari middleware auth
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token FCM tidak tersedia" });
    }

    const user = await User.findByIdAndUpdate(userId, { fcmToken: token }, { new: true });

    res.status(200).json({
      success: true,
      message: "Token FCM berhasil disimpan",
      user,
    });
  } catch (error) {
    console.error("❌ Gagal menyimpan token:", error.message);
    res.status(500).json({ success: false, message: "Gagal menyimpan token" });
  }
};

module.exports = {
  sendNotificationToCustomerByOrderStatus,
  sendNotificationHandler,
};
