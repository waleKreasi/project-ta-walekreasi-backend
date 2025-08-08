const sendNotification = require("../../helpers/fcm");
const Order = require("../../models/Order");
const User = require("../../models/User");

// ✅ Pesan status dalam bahasa Indonesia
const statusMessages = {
  pending: "⌛ Pesanan Anda sedang menunggu konfirmasi. Mohon ditunggu.",
  processing: "📦 Pesanan Anda sedang diproses. Kami akan segera mengirimkannya.",
  shipped: "🚚 Pesanan Anda sedang dalam perjalanan. Mohon bersiap untuk menerima paket.",
  delivered: "🫴Pesanan Anda telah diterima. Terima kasih telah berbelanja bersama kami!",
  rejected: "❌ Maaf, pesanan Anda tidak dapat diproses. Silakan cek detail pesanan untuk informasi lebih lanjut.",
};

// ✅ Kirim notifikasi berdasarkan status pesanan
const sendNotificationToCustomerByOrderStatus = async (orderId, status) => {
  try {
    console.log("✅ Running sendNotificationToCustomerByOrderStatus");

    const order = await Order.findById(orderId).populate("userId");
    if (!order || !order.userId) {
      console.log("❌ Order atau user tidak ditemukan");
      return;
    }

    const fcmToken = order.userId.fcmToken;
    if (!fcmToken) {
      console.log("❌ Token FCM tidak tersedia untuk user ini");
      return;
    }

    const messageBody = statusMessages[status] || `Status pesanan Anda saat ini: ${status}`;

    await sendNotification(fcmToken, {
      title: "📢 Status Pesanan Anda",
      body: messageBody,
      data: {
        orderId: orderId.toString(),
        status: status,
      },
    });

    console.log("✅ Notifikasi berhasil dikirim");
  } catch (error) {
    console.error("❌ Gagal mengirim notifikasi:", error.message);
  }
};

// ✅ Simpan token FCM user saat login atau refresh
const sendNotificationHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token FCM tidak tersedia" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken: token },
      { new: true }
    );

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
