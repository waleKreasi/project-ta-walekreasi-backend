const Order = require("../../models/Order");
const { sendNotificationToCustomerByOrderStatus } = require("../common/notification-controller");
const mongoose = require("mongoose"); 
const getOrdersForSeller = async (req, res) => {
  try {
    const sellerId = req.user._id; // seller yg sedang login

    // Cari semua order yang relevan dengan seller
    const orders = await Order.find({
      $or: [
        { sellerId: sellerId }, // order langsung by sellerId
        { "cartItems.sellerId": sellerId } // order multi-seller di cartItems
      ]
    }).sort({ orderDate: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Tidak ada pesanan untuk seller ini" });
    }

    // Filter cartItems supaya seller hanya lihat produk miliknya
    const filteredOrders = orders.map(order => {
      let itemsForSeller = order.cartItems.filter(
        item => item.sellerId?.toString() === sellerId.toString()
      );

      return {
        _id: order._id,
        userId: order.userId,
        addressInfo: order.addressInfo,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        totalAmount: order.totalAmount,
        orderDate: order.orderDate,
        orderUpdateDate: order.orderUpdateDate,
        isPaidToSeller: order.isPaidToSeller,
        paidToSellerAt: order.paidToSellerAt,
        cartItems: itemsForSeller, // hanya item milik seller
      };
    }).filter(order => order.cartItems.length > 0); // buang order yg tdk ada item seller

    return res.status(200).json(filteredOrders);

  } catch (error) {
    console.error("Error getOrdersForSeller:", error);
    return res.status(500).json({ message: "Gagal mengambil pesanan seller", error: error.message });
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    // ✅ Kirim notifikasi dengan _id yang sudah pasti valid
    await sendNotificationToCustomerByOrderStatus(order._id, orderStatus);

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
  getOrdersForSeller,
  getOrderDetailsForSeller,
  updateOrderStatus,
};
