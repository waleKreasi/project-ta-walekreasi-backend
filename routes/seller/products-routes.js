const express = require("express");
const {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} = require("../../controllers/seller/products-controller");
const { upload } = require("../../helpers/cloudinary");
const { isAuthenticated, isSeller, authMiddleware } = require("../../controllers/auth/auth-controller");

const router = express.Router();

router.post("/upload-image" ,authMiddleware, isAuthenticated, isSeller, upload.single("my_file"), handleImageUpload);
router.post("/add", authMiddleware,isAuthenticated, isSeller, addProduct);
router.put("/edit/:id",authMiddleware, isAuthenticated, isSeller, editProduct);
router.delete("/delete/:id",authMiddleware, isAuthenticated, isSeller, deleteProduct);
router.get("/get", authMiddleware, isAuthenticated, isSeller, fetchAllProducts);
router.get("/my-products", authMiddleware, isAuthenticated, isSeller, async (req, res) => {
  try {
    const products = await Product.find({ storeId: req.user.storeId });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
