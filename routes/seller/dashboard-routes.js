// dashboard-routes.js
const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/seller/dashboard-controller');

const { isAuthenticated, isSeller, authMiddleware } = require("../../controllers/auth/auth-controller");

// Route untuk mengambil data dashboard seller
router.get("/stats", authMiddleware, isAuthenticated, isSeller, dashboardController.getSellerDashboardData);

module.exports = router;
