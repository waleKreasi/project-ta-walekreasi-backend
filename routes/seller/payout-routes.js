const express = require("express");
const router = express.Router();
const { getSellerPayouts } = require("../../controllers/seller/payout-controller");
const {  authMiddleware, isSeller } = require("../../controllers/auth/auth-controller");

// Seller melihat pembayaran mereka
router.get("/my-payouts", authMiddleware, isSeller, getSellerPayouts);

module.exports = router;
