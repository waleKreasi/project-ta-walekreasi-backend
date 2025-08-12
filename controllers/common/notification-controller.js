const sendNotification = require("../../helpers/fcm");
const Order = require("../../models/Order");
const User = require("../../models/User");

// ✅ Pesan status untuk customer
const statusMessages = {
  pending: "⌛ Pesanan Anda sedang menunggu konfirmasi. Mohon ditunggu.",
  processing: "📦 Pesanan Anda sedang diproses. Kami akan segera mengirimkannya.",
  shipped: "🚚 Pesanan Anda sedang dalam perjalanan. Mohon bersiap untuk menerima paket.",
  delivered: "🫴 Pesanan Anda telah diterima. Terima kasih telah berbelanja bersama kami!",
  rejected: "❌ Maaf, pesanan Anda tidak dapat diproses. Silakan cek detail pesanan untuk informasi lebih lanjut.",
};

// ✅ Kirim notifikasi ke customer berdasarkan status pesanan
const sendNotificationToCustomerByOrderStatus = async (orderId, status) => {
  try {
    console.log("📢 sendNotificationToCustomerByOrderStatus running...");

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

    const messageBody =
      statusMessages[status] || `Status pesanan Anda saat ini: ${status}`;

    await sendNotification(fcmToken, {
      title: "📢 Status Pesanan Anda",
      body: messageBody,
      data: {
        orderId: orderId.toString(),
        status,
        type: "order_status",
      },
    });

    console.log("✅ Notifikasi customer berhasil dikirim");
  } catch (error) {
    console.error("❌ Gagal mengirim notifikasi ke customer:", error.message);
  }
};

// ✅ Kirim notifikasi ke seller saat ada order baru
const sendOrderNotificationToSeller = async (orderId) => {
  try {
    console.log("📢 sendOrderNotificationToSeller running...");

    const order = await Order.findById(orderId)
      .populate("sellerId")
      .populate("userId", "name"); // customer name

    if (!order || !order.sellerId) {
      console.log("❌ Order atau seller tidak ditemukan");
      return;
    }

    const fcmToken = order.sellerId.fcmToken;
    if (!fcmToken) {
      console.log("❌ Token FCM tidak tersedia untuk seller ini");
      return;
    }

    await sendNotification(fcmToken, {
      title: "🛒 Pesanan Baru Diterima",
      body: `Anda mendapatkan pesanan baru dari ${order.userId?.name || "customer"}.`,
      data: {
        orderId: orderId.toString(),
        type: "new_order",
      },
    });

    console.log("✅ Notifikasi seller berhasil dikirim");
  } catch (error) {
    console.error("❌ Gagal mengirim notifikasi ke seller:", error.message);
  }
};

// ✅ Kirim notifikasi welcoming message untuk customer baru register
const sendWelcomeNotificationToCustomer = async (userId) => {
  try {
    console.log("📢 sendWelcomeNotificationToCustomer running...");

    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User tidak ditemukan");
      return;
    }

    if (!user.fcmToken) {
      console.log("❌ Token FCM tidak tersedia untuk user ini");
      return;
    }

    await sendNotification(user.fcmToken, {
      title: "👋 Selamat Datang di Marketplace Kami",
      body: `Halo ${user.name || "Customer"}, terima kasih telah mendaftar. Selamat berbelanja!`,
      data: {
        type: "welcome",
      },
    });

    console.log("✅ Welcome notification berhasil dikirim");
  } catch (error) {
    console.error("❌ Gagal mengirim welcome notification:", error.message);
  }
};

// ✅ Simpan token FCM user saat login atau refresh
const sendNotificationHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token FCM tidak tersedia" });
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
  sendOrderNotificationToSeller,
  sendWelcomeNotificationToCustomer,
  sendNotificationHandler,
};
