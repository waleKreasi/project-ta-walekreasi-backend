const express = require("express");

const {
  getOrdersForSeller,
  getOrderDetailsForSeller,
  updateOrderStatus,
} = require("../../controllers/seller/order-controller");

const router = express.Router();

router.get("/get", getOrdersForSeller);
router.get("/details/:id", getOrderDetailsForSeller);
router.put("/update/:id", updateOrderStatus);

module.exports = router;
