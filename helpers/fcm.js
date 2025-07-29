const admin = require("firebase-admin");

// Inisialisasi Firebase Admin
const serviceAccount = require("../path-ke-service-account-key.json");

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
