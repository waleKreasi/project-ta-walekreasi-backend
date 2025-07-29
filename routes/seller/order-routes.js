const express = require("express");

const {
  getAllOrdersOfAllUsers,
  getOrderDetailsForSeller,
  updateOrderStatus,
} = require("../../controllers/seller/order-controller");

const router = express.Router();

router.get("/get", getAllOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForSeller);
router.put("/update/:id", updateOrderStatus);

module.exports = router;
