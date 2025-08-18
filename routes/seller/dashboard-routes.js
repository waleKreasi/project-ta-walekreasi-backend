// dashboard-routes.js
const express = require('express');
const router = express.Router();

const getSellerDashboardData = require('../../controllers/seller/dashboard-controller');

const { isAuthenticated, isSeller, authMiddleware } = require("../../controllers/auth/auth-controller");

// Route untuk mengambil data dashboard seller
router.get("/", authMiddleware, isAuthenticated, isSeller, getSellerDashboardData);

module.exports = router;
