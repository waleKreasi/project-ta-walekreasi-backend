const express = require("express");
const { sendNotificationHandler } = require("../../controllers/common/notification-controller");
const { authMiddleware } = require("../../controllers/auth/auth-controller");


const router = express.Router();

// ✅ POST /api/notification/save-token
router.post("/save-token", authMiddleware, sendNotificationHandler);

module.exports = router;
