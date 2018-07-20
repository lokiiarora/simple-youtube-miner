const mongoose = require("mongoose");

const metaData = new mongoose.Schema({
	parentRef: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "YtUrls",
		unique: true
	},
	thumbnail_url: {
		type: String,
		required: true
	},
	keywords: [
		{
			type: String
		}
	],
	author: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true,
		default: ""
	},
	publishedAt: {
		type: Date,
		required: true,
		default: Date.now()
	},
	view_count: {
		type: Number,
		required: true
	},
	length_seconds: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model("YtMetaData", metaData);
