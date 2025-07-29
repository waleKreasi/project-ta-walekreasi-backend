const mongoose = require("mongoose");

const SellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  // Data Identitas dan Domisili
  nik: {
    type: String,
    required: false,
  },
  domicileAddress: {
    type: String,
    required: true,
  },

  // Data Usaha
  storeName: {
    type: String,
    required: true,
  },
  storeDescription: {
    type: String,
  },
  productionAddress: {
    type: String,
  },
  storeLogoUrl: {
    type: String,
  },
  storeBannerUrl: {
    type: String,
  },

  // Data Pembayaran
  bankAccountOwner: {
    type: String,
  },
  bankName: {
    type: String,
  },
  bankAccountNumber: {
    type: String,
  },
  eWalletsAccountOwner: {
    type: String,
  },
  eWallet: {
    type: String,
  },
  eWalletAccountNumber: {
    type: String,
  },

  // Persetujuan
  agreedToTerms: {
    type: Boolean,
    required: true,
    default: false,
  },

  // Tanggal Daftar
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Seller = mongoose.model("Seller", SellerSchema);
module.exports = Seller;