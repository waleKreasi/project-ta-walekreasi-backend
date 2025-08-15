const User = require("../../models/User");
const Order = require("../../models/Order");

const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Ambil jumlah seller dan customer
    const sellerCount = await User.countDocuments({ role: "seller" });
    const customerCount = await User.countDocuments({ role: "customer" });

    // 2. Tentukan rentang waktu untuk data mingguan (7 hari terakhir)
    const now = new Date();
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7)); // Cara yang lebih ringkas

    // 3. Gunakan aggregation pipeline untuk mendapatkan data yang relevan
    const weeklyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $in: ["terbayar","pending","prosessing","shipped","delivered"] },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // Mengelompokkan berdasarkan hari (1=Minggu, 7=Sabtu)
          totalRevenue: { $sum: "$totalAmount" },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // 4. Hitung total revenue dan total orders dari hasil aggregation
    const totalRevenue = weeklyStats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
    const totalOrders = weeklyStats.reduce((sum, stat) => sum + stat.totalOrders, 0);

    // 5. Ubah format data harian agar sesuai dengan chart
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const weeklyRevenue = weeklyStats.map(stat => ({
      day: dayNames[stat._id - 1], 
      revenue: stat.totalRevenue,
    }));
    
    // 6. Kirim semua data ke front-end
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