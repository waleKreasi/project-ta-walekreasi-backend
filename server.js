require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Route imports...
const authRouter = require("./routes/auth/auth-routes");
const SellerProductsRouter = require("./routes/seller/products-routes");
const SellerOrderRouter = require("./routes/seller/order-routes");
const SellerProfileRouter = require("./routes/seller/profile-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopStoreRouter = require("./routes/shop/store-routes");
const payoutRoutes = require("./routes/admin/payout-routes");
const adminDashboardRoutes = require ("./routes/admin/dashboard-route");
const infoRoutes = require ("./routes/admin/Info-routes");
const bannerRoutes = require("./routes/admin/banner-route");
const notificationRoutes = require("./routes/common/notification-routes");


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log(error));

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Raw body parser khusus untuk Midtrans webhook
app.use("/api/shop/order/midtrans-callback", express.raw({ type: "*/*" }));

// ✅ JSON parser untuk semua route lainnya
app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: [ process.env.CLIENT_URL || "http://localhost:5173" , "http://localhost:4173"],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Expires", "Pragma"],
    credentials: true,
  })
);


// Route setup
app.use("/api/auth", authRouter);
app.use("/api/store/products", SellerProductsRouter);
app.use("/api/store/orders", SellerOrderRouter);
app.use("/api/store/profile", SellerProfileRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/store", shopStoreRouter);
app.use("/api/admin/payout", payoutRoutes);
app.use("/api/admin/dashboard" , adminDashboardRoutes);
app.use("/api/admin/info" , infoRoutes);
app.use("/api/admin/banner", bannerRoutes);
app.use("/api/admin/notification", notificationRoutes);




app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
