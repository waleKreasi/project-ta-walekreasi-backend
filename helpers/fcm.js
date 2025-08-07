const admin = require("firebase-admin");

// Ambil dari environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG); // Ubah di Railway

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const sendNotification = async (fcmToken, payload) => {
  try {
    const response = await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {}, // Optional
    });

    console.log("Notifikasi berhasil dikirim:", response);
    return response;
  } catch (error) {
    console.error("Gagal kirim notifikasi:", error);
    throw error;
  }
};

module.exports = sendNotification;
