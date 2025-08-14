const express = require("express");
const {
  getUnpaidSellersForPayout,
  getUnpaidOrdersBySellerId,
  markOrdersPaidToSeller,
  getPayoutHistoryBySeller,
  getAllPayoutHistory, // Impor fungsi baru
} = require("../../controllers/admin/payout-controller");
const {
  authMiddleware,
  isAdmin,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Endpoint baru untuk mendapatkan daftar ringkasan seller yang perlu dibayar
router.get("/unpaid-sellers", authMiddleware, isAdmin, getUnpaidSellersForPayout);

// Endpoint baru untuk mendapatkan detail pesanan yang belum dibayar per seller
router.get("/unpaid-orders/:sellerId", authMiddleware, isAdmin, getUnpaidOrdersBySellerId);

// Endpoint untuk menandai pembayaran (tetap sama)
router.post("/mark-paid", authMiddleware, isAdmin, markOrdersPaidToSeller);

// Endpoint untuk mendapatkan riwayat pembayaran per seller
router.get("/history/:sellerId", authMiddleware, isAdmin, getPayoutHistoryBySeller);

// Endpoint baru untuk mendapatkan SEMUA riwayat pembayaran
router.get("/history/all", authMiddleware, isAdmin, getAllPayoutHistory);

module.exports = router;
