const express = require("express");
const { getPayoutsBySeller } = require("../../controllers/seller/payout-controller");
const { authMiddleware ,isAuthenticated, isSeller,} = require("../../controllers/auth/auth-controller");

const router = express.Router();

// Seller melihat pembayaran mereka
router.get("/my-payouts",authMiddleware, isAuthenticated, isSeller, getPayoutsBySeller);

module.exports = router;
