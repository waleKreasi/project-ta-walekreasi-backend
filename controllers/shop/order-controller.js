const mongoose = require("mongoose");
const snap = require("../../helpers/midtrans");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const { sendOrderNotificationToSeller } = require("../common/notification-controller"); 

// Membuat pesanan dan token Midtrans Snap
const createOrder = async (req, res) => {
  try {
    const { userId, cartId, cartItems, addressInfo } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User tidak ditemukan." });

    const updatedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Produk tidak ditemukan: ${item.productId}`);

        const seller = await Seller.findById(product.sellerId);

        return {
          productId: product._id.toString(),
          sellerId: product.sellerId,
          storeName: seller?.storeName || "Toko Tidak Diketahui",
          sellerPhone: seller?.phoneNumber || "08xxxx",
          title: product?.title || "Produk",
          image: product?.image || "",
          price: product?.salePrice > 0 ? product.salePrice : product.price,
          quantity: item.quantity,
        };
      })
    );

    const totalAmount = updatedCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const sellerId = updatedCartItems[0]?.sellerId;

    const formattedAddressInfo = {
      addressId: addressInfo.addressId,
      receiverName: addressInfo.receiverName,
      address: addressInfo.address,
      city: addressInfo.city,
      pincode: addressInfo.pincode,
      phone: addressInfo.phone,
      notes: addressInfo.notes,
    };

    const newOrder = new Order({
      userId,
      sellerId,
      cartId,
      cartItems: updatedCartItems,
      addressInfo: formattedAddressInfo,
      orderStatus: "pending",
      paymentStatus: "Belum Dibayar",
      totalAmount,
      orderDate: new Date(),
    });

    await newOrder.save();

    // ✅ Kirim notifikasi ke seller
    try {
      await sendOrderNotificationToSeller(newOrder._id);
    } catch (notifyErr) {
      console.error("❌ Gagal mengirim notifikasi ke seller:", notifyErr.message);
    }

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: newOrder._id.toString(),
        gross_amount: totalAmount,
      },
      item_details: updatedCartItems.map((item) => ({
        id: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: `${item.title} | Toko: ${item.storeName}`.slice(0, 50),
      })),
      customer_details: {
        first_name: user.userName,
        phone: user.phoneNumber,
        email: user.email,
      },
      custom_field1: updatedCartItems[0]?.storeName || "Toko Tidak Diketahui",
    });

    res.status(201).json({
      success: true,
      snapToken: transaction.token,
      redirectUrl: transaction.redirect_url,
      orderId: newOrder._id,
    });
  } catch (err) {
    console.error("Midtrans error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Gagal membuat pesanan. Silakan coba lagi nanti.",
    });
  }
};

// ... fungsi lain tetap sama (tidak diubah)
const capturePayment = async (req, res) => {
  try {
    const { orderId, transactionStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan.",
      });
    }

    if (["settlement", "capture"].includes(transactionStatus)) {
      order.paymentStatus = "Terbayar";
      order.orderStatus = 'processing';
      order.orderUpdateDate = new Date();

      for (let item of order.cartItems) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.totalStock -= item.quantity;
          await product.save();
        }
      }

      await Cart.findByIdAndDelete(order.cartId);
      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Pembayaran berhasil dikonfirmasi.",
    });
  } catch (err) {
    console.error("Capture error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses pembayaran.",
    });
  }
};

const midtransCallback = async (req, res) => {
  try {
    const rawBody = req.body.toString("utf8");
    const { order_id, transaction_status } = JSON.parse(rawBody);

    console.log("Midtrans callback received:", { order_id, transaction_status });

    const order = await Order.findById(order_id);
    if (!order) return res.status(404).send("Pesanan tidak ditemukan.");

    if (["settlement", "capture"].includes(transaction_status)) {
      order.paymentStatus = "Terbayar";
      order.orderStatus = "processing";
      order.orderUpdateDate = new Date();

      await Cart.findByIdAndDelete(order.cartId);
      await order.save();
    }

    res.status(200).send("Callback berhasil diproses.");
  } catch (err) {
    console.error("Callback error:", err);
    res.status(500).send("Gagal memproses callback.");
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const objectId = new mongoose.Types.ObjectId(userId);

    const orders = await Order.find({ userId: objectId });

    if (!orders.length) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pesanan.",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Detail pesanan tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    console.error("Get order detail error:", err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil detail pesanan.",
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  midtransCallback,
};
