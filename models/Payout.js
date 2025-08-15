const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  proofImageUrl: {
    type: String, // URL gambar bukti pembayaran
  },
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending",
  },
  paidAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("Payout", payoutSchema);
