const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false, // ubah ke true untuk production
  serverKey: 'SB-Mid-server-oB6N_L7x6XyGBG1BS8oW-TDt'
});

module.exports = snap;
