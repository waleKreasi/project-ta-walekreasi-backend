// dashboard-routes.js
const express = require('express');
const router = express.Router();

const dashboardController = require('../../controllers/seller/dashboard-controller');

// const {
//     authMiddleware,
//     isSeller,
// } = require('../../controllers/auth/auth-controller');

// Route untuk mengambil data dashboard seller
router.get("/stats",dashboardController.getSellerDashboardData);

module.exports = router;
