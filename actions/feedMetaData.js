const { getInfo } = require("ytdl-core");
const mongoose = require("mongoose");
const URLModel = require("../models/urls");
const MetaModel = require("../models/metaDataModel");
const { MONGO_URI } = require("../settings");
mongoose.Promise = global.Promise;
mongoose.set("debug", true);
mongoose.connect(MONGO_URI).then(async () => {
  await init();
});

const perPromise = data => {
  return new Promise((resolve, reject) => {
    console.log(`https://youtube.com/watch?v=${data.href}`);
    getInfo(`https://youtube.com/watch?v=${data.href}`, (err, info) => {
      if (err) reject(err);
      else {
        resolve(info);
      }
    });
  });
};

const binData = (data, id) => ({
  parentRef: id,
  thumbnail_url: data.thumbnail_url,
  keywords: data.keywords,
  author: data.author,
  title: data.title,
  description: data.description || "",
  publishedAt: new Date(data.published),
  view_count: parseInt(data.view_count, 10),
  length_seconds: parseInt(data.length_seconds, 10)
});

const init = async () => {
  let i = 0;
  const cursor = URLModel.collection
    .find({})
    .sort("createdAt")
    .stream();
  for (
    let doc = await cursor.next();
    await cursor.hasNext();
    doc = await cursor.next()
  ) {
    try {
      const dataFromMetaModel = await MetaModel.findOne({ parentRef: doc._id });
      if (dataFromMetaModel) {
        console.log("Already exists");
      } else {
        const info = await perPromise(doc);
        const docMeta = new MetaModel(binData(info, doc._id));
        await docMeta.save();
        i = await MetaModel.collection.countDocuments();
        console.log(`Saved ${i}th video`);
      }
    } catch (e) {
      console.error(e);
    }
  }
};

process.on("unhandledRejection", console.error);
