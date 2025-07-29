const express = require("express");
const {
  getUnpaidOrdersBySeller,
  markOrdersPaidToSeller,
} = require("../../controllers/admin/payout-controller");
const {
  authMiddleware,
  isAdmin,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.get("/unpaid", authMiddleware, isAdmin, getUnpaidOrdersBySeller);
router.post("/mark-paid", authMiddleware, isAdmin, markOrdersPaidToSeller);

module.exports = router;
