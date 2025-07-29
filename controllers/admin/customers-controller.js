const User = require("../../models/User");

const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select(
      "_id userName email createdAt"
    );

    res.status(200).json({
      success: true,
      message: "Data customer berhasil diambil",
      customers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data customer",
      error: error.message,
    });
  }
};

module.exports = { getAllCustomers };
