const Order = require("../../models/Order");
const User = require("../../models/User");
const Notification = require("../../models/Notification");
const sendNotification = require("../../utils/sendNotification");

exports.sendNotificationToCustomerByOrderStatus = async (orderId, status) => {
  try {
    const order = await Order.findById(orderId).populate("userId");
    if (!order || !order.userId?.fcmToken) {
      console.log("❌ Order atau FCM Token customer tidak ditemukan.");
      return;
    }

    const customer = order.userId;
    const payload = {
      title: "Status Pesanan Anda",
      body: `Pesanan Anda kini berstatus: ${status}`,
    };

    // Kirim notifikasi ke token milik customer
    await sendNotification(customer.fcmToken, payload);

    // Simpan riwayat notifikasi
    await Notification.create({
      title: payload.title,
      body: payload.body,
      sentAt: new Date(),
    });

    console.log(`✅ Notifikasi berhasil dikirim ke customer (${customer.email || customer._id})`);
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi ke customer:", error.message);
  }
};
