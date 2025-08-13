const User = require("../../models/User");
const Order = require("../../models/Order");

const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Ambil jumlah seller dan customer
    const sellerCount = await User.countDocuments({ role: "seller" });
    const customerCount = await User.countDocuments({ role: "customer" });

    // 2. Tentukan rentang waktu untuk data mingguan (7 hari terakhir)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    // 3. Gunakan aggregation pipeline tunggal untuk mendapatkan semua data yang relevan
    const weeklyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          // Filter pesanan hanya yang statusnya paid atau delivered
          status: { $in: ["paid", "delivered"] },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" }, // Mengelompokkan berdasarkan hari (1=Minggu, 7=Sabtu)
          totalRevenue: { $sum: "$totalPrice" },
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

    // 5. Ubah format data harian agar sesuai dengan Recharts dan JavaScript (0=Minggu, 6=Sabtu)
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const weeklyRevenue = weeklyStats.map(stat => ({
      // $dayOfWeek MongoDB mengembalikan 1 untuk Minggu, 2 untuk Senin, dst.
      // Kita kurangi 1 agar sesuai dengan indeks array JavaScript (0-6)
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