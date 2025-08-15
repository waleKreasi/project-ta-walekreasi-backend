const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  role: {
    type: String,
    enum: ["admin", "seller", "customer"],
    default: "customer",
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },
  fcmToken: {
    type: String,
    default: null,
  }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;
