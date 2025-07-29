const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
      isReviewed: {
        type: Boolean,
        default: false,
      },
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
      },
      storeName: String,
      sellerPhone: String,
    },
  ],
  
  addressInfo: {
    addressId: String,
    receiverName: String,
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  orderStatus: String,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,
  payerId: String,

  isPaidToSeller: {
    type: Boolean,
    default: false,
  },
  paidToSellerAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
