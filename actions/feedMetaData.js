// @ts-check
const { getInfo } = require("ytdl-core");
const mongoose = require("mongoose");
const URLModel = require("../models/urls");
const MetaModel = require("../models/metaDataModel");
const pm2 = require("pm2");
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

let cursor;

const init = async () => {
  let i = 0;
  if (!cursor) {
    cursor = await URLModel.collection.find({}).stream();
  }
  let doc = await cursor.next();
  try {
    const dataFromMetaModel = await MetaModel.findOne({
      parentRef: doc._id
    });
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
  if (await cursor.hasNext()) {
    await init();
  } else {
    console.log(`All clean!`);
    return;
  }
};

process.on("unhandledRejection", (...args) => {
  console.error(`Process has failed with ${args}\n Restarting it`);
  pm2.connect(err => {
    if (err) {
      console.error("Caught an error while restarting");
      console.error(err);
      process.exit(0);
    } else {
      pm2.restart("MetaScraper", (...reloadArgs) => {
        if (reloadArgs[0]) {
          console.error("Caught an error while restarting");
          console.error(reloadArgs[0]);
          process.exit(0);
        } else {
          console.log("Successfully restarted\nProcess info:");
          console.log(reloadArgs[1]);
        }
      });
    }
  });
});
