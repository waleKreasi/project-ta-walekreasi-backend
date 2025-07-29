require("dotenv").config();
const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false, // ubah ke true untuk production
  serverKey: process.env.MIDTRANS_SERVER_KEY
});

module.exports = snap;
