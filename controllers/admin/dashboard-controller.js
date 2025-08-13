const User = require("../../models/User");
const Order = require("../../models/Order");

const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Ambil jumlah seller dan customer
    const sellerCount = await User.countDocuments({ role: "seller" });
    const customerCount = await User.countDocuments({ role: "customer" });

    // 2. Tentukan rentang waktu untuk data mingguan (7 hari terakhir)
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // 3. Ambil semua pesanan (orders) dalam 7 hari terakhir
    const weeklyOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo },
      status: { $ne: "canceled" }, // Menghindari pesanan yang dibatalkan
    });

    // 4. Hitung total pendapatan dan total pesanan mingguan
    const totalRevenue = weeklyOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = weeklyOrders.length;
    
    // 5. Olah data mingguan per hari
    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "canceled" }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          totalRevenue: { $sum: "$totalPrice" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // 6. Siapkan data untuk grafik
    const weeklyRevenue = dailyStats.map(stat => ({
      day: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][stat._id],
      revenue: stat.totalRevenue,
    }));
    
    // 7. Kirim semua data ke front-end
    res.status(200).json({
      success: true,
      data: {
        sellerCount,
        customerCount,
        totalRevenue,
        totalOrders,
        weeklyRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data dashboard",
    });
  }
};
module.exports = { getAdminDashboardStats };