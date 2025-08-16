const mongoose = require("mongoose");

const SellerPayoutHistorySchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  amount: {
    type: Number,
    required: true,
  },
  paymentProofUrl: { // Field baru untuk menyimpan URL gambar
    type: String,
    required: true,
  },
  paidAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SellerPayoutHistory", SellerPayoutHistorySchema);