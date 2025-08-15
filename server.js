require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRouter = require("./routes/auth/auth-routes");

const SellerProductsRouter = require("./routes/seller/products-routes");
const SellerOrderRouter = require("./routes/seller/order-routes");
const SellerProfileRouter = require("./routes/seller/profile-routes");
const SellerDashboardRoute = require("./routes/seller/dashboard-routes");
const SellerPayoutRoute = require("./routes/seller/payout-routes");

const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopStoreRouter = require("./routes/shop/store-routes");

const payoutRoutes = require("./routes/admin/payout-routes");
const adminDashboardRoutes = require("./routes/admin/dashboard-route");
const infoRoutes = require("./routes/admin/Info-routes");
const bannerRoutes = require("./routes/admin/banner-route");
const notificationRoutes = require("./routes/common/notification-routes");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "https://walekreasi.vercel.app",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "DELETE", "PUT"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "Expires",
    "Pragma",
  ],
  credentials: true,
}));

// ✅ Middleware global
app.use(cookieParser());

// ✅ Midtrans Webhook: Raw body hanya di path tertentu
app.use("/api/shop/order/midtrans-callback", express.raw({ type: "*/*" }));

// ✅ Semua route lain pakai JSON body
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// ✅ API Routes
app.use("/api/auth", authRouter);
app.use("/api/store/products", SellerProductsRouter);
app.use("/api/store/orders", SellerOrderRouter);
app.use("/api/store/profile", SellerProfileRouter);
app.use("/api/store/dashboard", SellerDashboardRoute);
app.use("/api/store/payout", SellerPayoutRoute);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/store", shopStoreRouter);
app.use("/api/admin/payout", payoutRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/info", infoRoutes);
app.use("/api/admin/banner", bannerRoutes);
app.use("/api/notification", notificationRoutes);

// ✅ Default response
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Start Server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
