const express = require("express");
const router = express.Router();

const {
  getSellerProfile,
  updateSellerProfile,
  uploadStoreImage,
} = require("../../controllers/seller/profil-controller");

const {
  authMiddleware,
  isSeller,
} = require("../../controllers/auth/auth-controller");

const { upload } = require("../../helpers/cloudinary");

// Ambil profil seller
router.get("/get", authMiddleware, isSeller, getSellerProfile);

// Update profil seller (sekalian upload logo & banner)
router.put(
  "/edit",
  authMiddleware,
  isSeller,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateSellerProfile
);

// Upload gambar logo/banner secara terpisah (opsional)
router.post(
  "/upload-image",
  authMiddleware,
  isSeller,
  upload.single("my_file"),
  uploadStoreImage
);

module.exports = router;
