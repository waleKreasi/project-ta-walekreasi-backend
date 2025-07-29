const express = require("express");
const router = express.Router();
const { getAllTransactions, getTransactionById } = require("../../controllers/admin/transactions-controller");
const { authMiddleware, isAdmin } = require("../../controllers/auth/auth-controller");

router.get("/transactions", authMiddleware, isAdmin, getAllTransactions);
router.get("/transaction/:id", authMiddleware, isAdmin, getTransactionById);

module.exports = router;
