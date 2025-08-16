const express = require("express");

const {
  getOrdersBySeller,
  getOrderDetailsForSeller,
  updateOrderStatus,
} = require("../../controllers/seller/order-controller");

const { isAuthenticated, isSeller, authMiddleware } = require("../../controllers/auth/auth-controller");
const router = express.Router();

router.get("/get", authMiddleware, isAuthenticated, isSeller, getOrdersBySeller);
router.get("/details/:id",authMiddleware, isAuthenticated, isSeller, getOrderDetailsForSeller);
router.put("/update/:id",authMiddleware, isAuthenticated, isSeller, updateOrderStatus);

module.exports = router;
