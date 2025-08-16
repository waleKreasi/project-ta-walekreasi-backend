const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Seller = require("../../models/Seller");
const { sendWelcomeNotificationToCustomer } = require("../common/notification-controller"); 

const JWT_SECRET = "PTA|HPL|wkPWA-2025";

// === Helper ===
const generateToken = (user) => jwt.sign({
  id: user._id,
  role: user.role,
  email: user.email,
  name: user.userName,
  phoneNumber: user.phoneNumber,
}, JWT_SECRET, { expiresIn: "60m" });

setTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,                     
    secure: isProduction,            
    sameSite: isProduction ? "None" : "Lax",  
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};



// === Auth ===
const registerUser = async (req, res) => {
  const { userName, email, password, phoneNumber, fcmToken } = req.body;

  try {
    // Cek apakah email sudah terdaftar
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Email sudah terdaftar!"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Simpan user baru
    const newUser = await User.create({
      userName,
      email,
      password: hashedPassword,
      phoneNumber,
      fcmToken,
      role: "customer" // default ke customer
    });

    // Kirim welcome notification (hanya untuk customer)
    if (newUser.role === "customer") {
      await sendWelcomeNotificationToCustomer(newUser._id);
    }

    res.status(201).json({
      success: true,
      message: "Pendaftaran berhasil",
      user: newUser
    });

  } catch (e) {
    console.error("❌ registerUser error:", e);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan"
    });
  }
};

const registerSeller = async (req, res) => {
  const { sellerName, phoneNumber, email, password, ...otherInfo } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email sudah digunakan!" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ userName: sellerName, email, phoneNumber, password: hashedPassword, role: "seller" });

    const seller = await Seller.create({ user: user._id, sellerName, phoneNumber, email, password, ...otherInfo });

    res.status(201).json({
      success: true,
      message: "Seller terdaftar",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        sellerId: seller._id,
      },
    });
  } catch (e) {
    console.error("Register Seller Error:", e);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Kata sandi salah" });

    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user._id,
        name: user.userName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Terjadi kesalahan" });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  }).json({ success: true, message: "Logout berhasil" });
};

// === Middleware ===
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ success: false, message: "Token tidak ditemukan" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Token tidak valid" });
  }
};

const isAuthenticated = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Harus login" });
  next();
};

const isRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ success: false, message: `Akses ditolak. Hanya ${role} yang diizinkan.` });
  }
  next();
};

module.exports = {
  registerUser,
  registerSeller,
  loginUser,
  logoutUser,
  authMiddleware,
  isAuthenticated,
  isSeller: isRole("seller"),
  isAdmin: isRole("admin"),
};
