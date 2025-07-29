const express = require("express");
const router = express.Router();
const { upload } = require("../../helpers/cloudinary");
const {
  uploadBanner,
  getAllBanners,
  deleteBanner,
} = require("../../controllers/admin/banner-controller");

// GET semua banner
router.get("/", getAllBanners);

// POST upload banner baru
router.post("/upload", upload.single("image"), uploadBanner);

// DELETE banner
router.delete("/:id", deleteBanner);

module.exports = router;
