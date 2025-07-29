const express = require("express");
const { authMiddleware, isAdmin } = require("../../controllers/auth/auth-controller");
const { getAdminDashboardStats } = require("../../controllers/admin/dashboard-controller");

const router = express.Router();

router.get("/stats", authMiddleware, isAdmin, getAdminDashboardStats);

module.exports = router;
