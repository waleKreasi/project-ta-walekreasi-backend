const express = require("express");
const router = express.Router();
const { getSellerPayouts } = require("../../controllers/seller/payout-controller");
const { isAuthenticated, isSeller, authMiddleware } = require("../../controllers/auth/auth-controller");

// Seller melihat pembayaran mereka
router.get("/my-payouts",authMiddleware, isAuthenticated, isSeller, getSellerPayouts);

module.exports = router;
