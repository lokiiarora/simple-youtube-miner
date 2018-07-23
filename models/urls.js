const mongoose = require("mongoose");

const urls = new mongoose.Schema(
  {
    href: {
      unique: true,
      type: String,
      required: true
    },
    done: {
      default: false,
      type: Boolean
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("YtUrls", urls);
