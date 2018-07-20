const mongoose = require("mongoose");

const urls = new mongoose.Schema(
	{
		href: {
			unique: true,
			type: String,
			required: true
		}
	},
	{
		timestamps: true
	}
);

module.exports = mongoose.model("YtUrls", urls);
