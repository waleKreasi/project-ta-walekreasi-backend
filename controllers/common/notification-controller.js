const User = require("../../models/User");
const Notification = require("../../models/Notification"); // ✅ Import model notifikasi
const admin = require("firebase-admin");
const serviceAccount = require("../../config/firebase-adminsdk.json");

// ✅ Inisialisasi Firebase Admin jika belum
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Simpan FCM Token user
exports.saveFcmToken = async (req, res) => {
  const userId = req.user?._id || req.body.userId;
  const { fcmToken } = req.body;

  if (!userId || !fcmToken || fcmToken.trim() === "") {
    return res.status(400).json({ message: "User ID dan FCM token wajib diisi." });
  }

  try {
    await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
    res.status(200).json({ message: "Token berhasil disimpan." });
  } catch (error) {
    console.error("❌ Gagal menyimpan token:", error);
    res.status(500).json({ message: "Gagal menyimpan token.", error: error.message });
  }
};

// ✅ Kirim notifikasi ke semua customer dan simpan ke riwayat
exports.sendNotificationToCustomers = async (req, res) => {
  try {
    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Judul dan isi notifikasi wajib diisi." });
    }

    const customers = await User.find({
      role: "customer",
      fcmToken: { $exists: true, $ne: null },
    });

    const tokens = customers.map((user) => user.fcmToken).filter(Boolean);

    if (tokens.length === 0) {
      return res.status(400).json({ message: "Tidak ada customer dengan FCM token." });
    }

    const message = {
      notification: { title, body },
      tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log("📨 Notifikasi terkirim:", response);

    // ✅ Simpan ke riwayat notifikasi
    await Notification.create({ title, body });

    res.status(200).json({
      message: `Notifikasi dikirim ke ${response.successCount} dari ${tokens.length} customer.`,
    });
  } catch (error) {
    console.error("❌ Gagal mengirim notifikasi:", error);
    res.status(500).json({
      message: "Gagal mengirim notifikasi.",
      error: error.message || "Unknown error",
    });
  }
};

// ✅ Ambil daftar riwayat notifikasi
exports.getNotificationHistory = async (req, res) => {
  try {
    const history = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    console.error("❌ Gagal mengambil riwayat notifikasi:", error);
    res.status(500).json({ message: "Gagal mengambil riwayat notifikasi." });
  }
};
// ✅ Hapus semua riwayat notifikasi
exports.clearNotificationHistory = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.status(200).json({ message: "Semua riwayat notifikasi berhasil dihapus." });
  } catch (error) {
    console.error("❌ Gagal menghapus riwayat:", error);
    res.status(500).json({ message: "Gagal menghapus riwayat notifikasi." });
  }
};
