const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["intro", "landing", "customer"], 
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: String,
    redirectUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", BannerSchema);
