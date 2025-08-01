const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Seller = require("../../models/Seller");

// Register user
const registerUser = async (req, res) => {
  const { userName, email, password, phoneNumber } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.status(400).json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      phoneNumber,
    });

    await newUser.save();
    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

// Register seller
const registerSeller = async (req, res) => {
  const {
    sellerName,
    phoneNumber,
    email,
    password,
    nik,
    domicileAddress,
    storeName,
    storeDescription,
    productionAddress,
    bankAccountOwner,
    bankName,
    bankAccountNumber,
    eWalletsAccountOwner,
    eWallet,
    eWalletAccountNumber,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Seller sudah terdaftar dengan email yang sama! Silakan coba lagi.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName: sellerName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "seller",
    });
    await newUser.save();

    const newSeller = new Seller({
      user: newUser._id,
      sellerName,
      phoneNumber,
      email,
      password,
      nik,
      domicileAddress,
      storeName,
      storeDescription,
      productionAddress,
      bankAccountOwner,
      bankName,
      bankAccountNumber,
      eWalletsAccountOwner,
      eWallet,
      eWalletAccountNumber,
    });
    await newSeller.save();

    res.status(201).json({
      success: true,
      message: "Pendaftaran seller berhasil.",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
        sellerId: newSeller._id,
      },
    });
  } catch (error) {
    console.error("Register Seller Error:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mendaftar.",
    });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan! Silahkan Mendaftar.",
      });

    const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
    if (!checkPasswordMatch)
      return res.status(401).json({
        success: false,
        message: "Kata Sandi salah! Silahkan Coba Lagi.",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        name: checkUser.userName,
        phoneNumber: checkUser.phoneNumber,
      },
      "PTA|HPL|wkPWA-2025",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }).status(200).json({
      success: true,
      message: "Berhasil Masuk !",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        name: checkUser.userName,
        phoneNumber: checkUser.phoneNumber,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Terjadi Kesalahan",
    });
  }
};

// Logout
const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  }).json({
    success: true,
    message: "Berhasil Keluar !",
  });
};

// Middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.",
    });

  try {
    const decoded = jwt.verify(token, "PTA|HPL|wkPWA-2025");
    req.user = decoded;
    console.log("Decoded JWT:", req.user);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Akses ditolak. Token tidak valid.",
    });
  }
};

const isAuthenticated = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    return res.status(401).json({
      success: false,
      message: "Anda harus login terlebih dahulu.",
    });
  }
};

const isSeller = (req, res, next) => {
  if (req.user?.role === "seller") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya seller yang diizinkan.",
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user?.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak. Hanya admin yang diizinkan.",
    });
  }
};

module.exports = {
  registerUser,
  registerSeller,
  loginUser,
  logoutUser,
  authMiddleware,
  isAuthenticated,
  isSeller,
  isAdmin,
};
