const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Notification = require("../../models/Notification");
const sendNotification = require("../../helpers/fcm");

exports.sendNotificationToCustomerByOrderStatus = async (orderId, status) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.warn("❌ orderId tidak valid:", orderId);
      return;
    }

    const order = await Order.findById(orderId).populate("userId");

    if (!order) {
      console.warn("❌ Order tidak ditemukan:", orderId);
      return;
    }

    const customer = order.userId;

    if (!customer || !mongoose.Types.ObjectId.isValid(customer._id)) {
      console.warn("❌ Data customer tidak valid:", customer);
      return;
    }

    if (!customer?.fcmToken) {
      console.warn("❌ FCM Token customer tidak tersedia:", customer._id);
      return;
    }

    const payload = {
      title: "Status Pesanan Anda",
      body: `Pesanan Anda kini berstatus: ${status}`,
      data: {
        orderId: order._id.toString(),
        type: "ORDER_UPDATE",
      },
    };

    await sendNotification(customer.fcmToken, payload);

    await Notification.create({
      userId: customer._id,
      orderId: order._id,
      title: payload.title,
      body: payload.body,
      sentAt: new Date(),
    });

    console.log(`✅ Notifikasi berhasil dikirim ke customer (${customer.email || customer._id})`);
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi ke customer:", error.message);
  }
};