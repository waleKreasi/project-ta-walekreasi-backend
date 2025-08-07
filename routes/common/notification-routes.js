const express = require("express");
const router = express.Router();
const { sendNotificationToCustomerByOrderStatus } = require("../../controllers/common/notification-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");

router.post("/save-token", authMiddleware, sendNotificationToCustomerByOrderStatus);



module.exports = router;