const express = require("express");
const {
  getUnpaidSellersForPayout,
  getUnpaidOrdersBySellerId,
  markOrdersPaidToSeller,
  getPayoutHistoryBySeller,
  getAllPayoutHistory,
} = require("../../controllers/admin/payout-controller");
const {
  authMiddleware,
  isAdmin,
} = require("../../controllers/auth/auth-controller");
const { upload } = require("../../helpers/cloudinary"); // Tambahkan import ini

const router = express.Router();

// Endpoint baru untuk mendapatkan daftar ringkasan seller yang perlu dibayar
router.get("/unpaid-sellers", authMiddleware, isAdmin, getUnpaidSellersForPayout);

// Endpoint baru untuk mendapatkan detail pesanan yang belum dibayar per seller
router.get("/unpaid-orders/:sellerId", authMiddleware, isAdmin, getUnpaidOrdersBySellerId);

// Endpoint untuk menandai pembayaran dengan middleware upload file
router.post(
  "/mark-paid",
  authMiddleware,
  isAdmin,
  upload.single("paymentProof"), // Middleware upload di sini
  markOrdersPaidToSeller
);

// Pindahkan rute yang lebih spesifik ini ke atas
router.get("/history/all", authMiddleware, isAdmin, getAllPayoutHistory);

// Endpoint untuk mendapatkan riwayat pembayaran per seller
router.get("/history/:sellerId", authMiddleware, isAdmin, getPayoutHistoryBySeller);

module.exports = router;
