require("dotenv").config();

const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const storage = new multer.memoryStorage();

async function imageUploadUtil(fileBuffer, mimetype) {
  const base64Image = `data:${mimetype};base64,${fileBuffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64Image, {
    resource_type: "auto",
    folder: "banner",
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
