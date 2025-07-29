const express = require("express");
const router = express.Router();
const { saveFcmToken, 
        sendNotificationToCustomers,
        getNotificationHistory,
        clearNotificationHistory  } = require("../../controllers/common/notification-controller");
const { authMiddleware, isAdmin } = require("../../controllers/auth/auth-controller");

router.post("/save-token", authMiddleware, saveFcmToken);
router.post("/send-to-customers", authMiddleware, isAdmin, sendNotificationToCustomers);
router.get("/history", authMiddleware, isAdmin, getNotificationHistory);
router.delete("/history/clear", authMiddleware, isAdmin, clearNotificationHistory);


module.exports = router;