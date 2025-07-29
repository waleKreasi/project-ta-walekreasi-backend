const Order = require("../../models/Order");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");

const addProductReview = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { productId, userId, userName, reviewMessage, reviewValue, orderId } = req.body;

    // 1. Cek validitas pesanan
    const order = await Order.findOne({
      _id: orderId,
      userId,
      "cartItems.productId": productId,
      orderStatus: "Sudah Diterima",
    });

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "Pesanan tidak ditemukan atau belum diterima.",
      });
    }

    // 2. Cek review ganda
    const existingReview = await ProductReview.findOne({
      productId,
      userId,
      orderId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah memberi ulasan untuk produk ini dalam pesanan ini.",
      });
    }

    // 3. Simpan review baru
    const newReview = new ProductReview({
      productId,
      userId,
      orderId,
      userName,
      reviewMessage,
      reviewValue,
    });

    await newReview.save();

    // 4. Update average review di model produk
    const allReviews = await ProductReview.find({ productId });
    const averageReview =
      allReviews.reduce((sum, r) => sum + r.reviewValue, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      averageReview: Number(averageReview.toFixed(1)), // <- Penting!
    });

    // 5. Tandai produk sebagai sudah di-review di order
    await Order.updateOne(
      {
        _id: order._id,
        "cartItems.productId": productId,
      },
      {
        $set: {
          "cartItems.$.isReviewed": true,
        },
      }
    );

    res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (e) {
    console.error("Gagal menyimpan ulasan:", e);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menyimpan ulasan.",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await ProductReview.find({ productId });

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.error("Gagal mengambil review:", e);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar ulasan.",
    });
  }
};

module.exports = { addProductReview, getProductReviews };
