const Order = require("../../models/Order");
const { sendNotificationToCustomerByOrderStatus } = require("../common/notification-controller");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "Tidak ada pesanan yang ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Terjadi Kesalahan!",
    });
  }
};

const getOrderDetailsForSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate("userId", "userName phoneNumber");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan Tidak ditemukan!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Terjadi Kesalahan!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'rejected'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status pesanan tidak valid!",
      });
    }

    if (!id || id.length < 12) {
      return res.status(400).json({
        success: false,
        message: "ID pesanan tidak valid!",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan!",
      });
    }

    await Order.findByIdAndUpdate(id, { orderStatus });

    await sendNotificationToCustomerByOrderStatus(id, orderStatus);

    return res.status(200).json({
      success: true,
      message: "Status pesanan berhasil diperbarui!",
    });

  } catch (e) {
    console.error("❌ updateOrderStatus error:", e.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi Kesalahan!",
    });
  }
};


module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForSeller,
  updateOrderStatus,
};
