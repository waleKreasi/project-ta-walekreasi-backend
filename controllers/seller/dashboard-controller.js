// dashboard-controller.js
const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Seller = require("../../models/Seller");

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

const getSellerDashboardData = async (req, res) => {
  try {
    // ✅ Ambil seller berdasarkan user yang login
    const seller = await Seller.findOne({ user: req.user.id });
    if (!seller) {
      return res.status(404).json({
        status: "error",
        message: "Toko tidak ditemukan.",
      });
    }

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // ✅ Agregasi data bulanan
    const monthlyData = await Order.aggregate([
      {
        $match: {
          sellerId: seller._id,
          orderDate: { $gte: startOfYear, $lte: today },
          orderStatus: "delivered",
          paymentStatus: "Terbayar",
        },
      },
      {
        $group: {
          _id: { month: { $month: "$orderDate" } },
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    // ✅ Buat array 12 bulan, isi 0 kalau tidak ada data
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const data = monthlyData.find((item) => item._id.month === month);
      return {
        name: monthNames[i],
        totalRevenue: data ? data.totalRevenue : 0,
        totalOrders: data ? data.totalOrders : 0,
      };
    });

    res.status(200).json({
      status: "success",
      data: monthlyStats,
    });
  } catch (error) {
    console.error("❌ Gagal mendapatkan data dashboard:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server saat mengambil data dashboard.",
    });
  }
};

module.exports = getSellerDashboardData;
