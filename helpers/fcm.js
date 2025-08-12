const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendNotification = async (fcmToken, payload) => {
  try {
    const message = {
      token: fcmToken,
      notification: {
        title: payload.title || "Notifikasi Baru",
        body: payload.body || "",
      },
      data: {
        orderId: String(payload.data?.orderId || ""),
        type: String(payload.data?.type || ""),
      },
    };

    const response = await admin.messaging().send(message);
    console.log("✅ Notifikasi berhasil dikirim:", response);
    return response;
  } catch (error) {
    console.error("❌ Gagal kirim notifikasi:", error);
    throw error;
  }
};

module.exports = sendNotification;
