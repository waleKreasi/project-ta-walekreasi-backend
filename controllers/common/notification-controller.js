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

    // Menggunakan populate untuk mengambil data seller
    // dan juga data user (customer) untuk notifikasi
    const order = await Order.findById(orderId)
      .populate("sellerId")
      .populate("userId", "name"); // Mengambil nama customer

    // ✅ Langkah 1: Memeriksa keberadaan Order dan Seller
    if (!order) {
      console.log("❌ Order tidak ditemukan. ID:", orderId);
      return;
    }
    if (!order.sellerId) {
      console.log("❌ Order ditemukan, tetapi tidak ada sellerId.");
      return;
    }

    // ✅ Langkah 2: Log untuk verifikasi ID Seller dan token
    console.log("ℹ️ ID Seller dari Order:", order.sellerId._id);
    console.log("ℹ️ Token FCM dari Database:", order.sellerId.fcmToken);

    const fcmToken = order.sellerId.fcmToken;

    // ✅ Langkah 3: Memeriksa apakah token FCM valid
    if (!fcmToken || typeof fcmToken !== 'string') {
      console.log("❌ Token FCM tidak valid atau tidak tersedia untuk seller ini.");
      return;
    }

    // ✅ Langkah 4: Mengirim notifikasi
    await sendNotification(fcmToken, {
      title: "🛒 Pesanan Baru Diterima",
      body: `Anda mendapatkan pesanan baru dari ${order.userId?.name || "customer"}.`,
      data: {
        orderId: orderId.toString(),
        type: "new_order",
      },
    });

    console.log("✅ Notifikasi seller berhasil dikirim.");
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
      console.log("❌ User tidak ditemukan. ID:", userId);
      return;
    }

    // ✅ Langkah 1: Tambahkan log untuk verifikasi token FCM
    console.log("ℹ️ User ID:", user._id);
    console.log("ℹ️ FCM Token yang ditemukan:", user.fcmToken);

    // ✅ Langkah 2: Periksa ketersediaan token secara ketat
    // Jika token belum ada, jangan kirim notifikasi dan log pesan yang jelas
    if (!user.fcmToken) {
      console.log("⚠️ Token FCM belum tersedia saat pendaftaran, notifikasi ditunda.");
      // Anda bisa menambahkan logika di sini untuk mencoba lagi nanti (retry mechanism)
      // atau menyimpan notifikasi sebagai "pending" di database
      return;
    }

    // ✅ Langkah 3: Kirim notifikasi jika token tersedia
    await sendNotification(user.fcmToken, {
      title: "👋 Selamat Datang di WaleKreasi",
      body: `Halo ${user.name || "Customer"}, terima kasih telah bergabung. Selamat berbelanja!`,
      data: {
        type: "welcome",
      },
    });

    console.log("✅ Welcome notification berhasil dikirim.");
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
