const express = require("express");
const router = express.Router();
const { getStoreBySellerId } = require("../../controllers/shop/store-controller");

router.get("/:sellerId", getStoreBySellerId);

module.exports = router;
