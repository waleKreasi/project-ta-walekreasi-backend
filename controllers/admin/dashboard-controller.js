const User = require("../../models/User");
const Order = require("../../models/Order");

const getAdminDashboardStats = async (req, res) => {
  try {
    const sellerCount = await User.countDocuments({ role: "seller" });
    const customerCount = await User.countDocuments({ role: "customer" });

    // Ambil 6 minggu terakhir
    const now = new Date();
    const sixWeeksAgo = new Date(now);
    sixWeeksAgo.setDate(now.getDate() - 42);

    const orders = await Order.find({ createdAt: { $gte: sixWeeksAgo } });

    const performance = {};

    orders.forEach((order) => {
      const weekNumber = Math.ceil(
        (now - order.createdAt) / (7 * 24 * 60 * 60 * 1000)
      );
      const label = `Minggu -${weekNumber}`;
      if (!performance[label]) performance[label] = 0;
      performance[label]++;
    });

    const weeklyPerformance = Object.entries(performance).map(([week, orders]) => ({
      week,
      orders,
    }));

    weeklyPerformance.sort((a, b) => a.week.localeCompare(b.week));

    res.status(200).json({
      success: true,
      data: {
        sellerCount,
        customerCount,
        weeklyPerformance,
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
