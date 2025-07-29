const Seller = require("../../models/Seller");
const { imageUploadUtil } = require("../../helpers/cloudinary");

// [GET] Menampilkan profil seller yang sedang login
const getSellerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const seller = await Seller.findOne({ user: userId });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Profil seller tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (error) {
    console.error("Gagal mendapatkan profil seller:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil profil seller.",
    });
  }
};

// [PUT] Memperbarui profil seller dan upload logo/banner jika ada
const updateSellerProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // Upload logo jika tersedia
    if (req.files?.logo) {
      const logoFile = req.files.logo[0];
      const base64 = logoFile.buffer.toString("base64");
      const dataUri = `data:${logoFile.mimetype};base64,${base64}`;
      const result = await imageUploadUtil(dataUri);
      updateData.storeLogoUrl = result.secure_url;
    }

    // Upload banner jika tersedia
    if (req.files?.banner) {
      const bannerFile = req.files.banner[0];
      const base64 = bannerFile.buffer.toString("base64");
      const dataUri = `data:${bannerFile.mimetype};base64,${base64}`;
      const result = await imageUploadUtil(dataUri);
      updateData.storeBannerUrl = result.secure_url;
    }

    const seller = await Seller.findOneAndUpdate(
      { user: userId },
      { $set: updateData },
      { new: true }
    );

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Profil seller tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profil seller berhasil diperbarui.",
      data: seller,
    });
  } catch (error) {
    console.error("Gagal memperbarui profil seller:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui profil seller.",
    });
  }
};

// [POST] Upload satu gambar umum (tidak digunakan langsung di update profil)
const uploadStoreImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Tidak ada file yang dikirim.",
      });
    }

    const buffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const base64 = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64}`;

    const result = await imageUploadUtil(dataUri);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Gagal upload gambar toko:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengunggah gambar.",
    });
  }
};

module.exports = {
  getSellerProfile,
  updateSellerProfile,
  uploadStoreImage,
};
