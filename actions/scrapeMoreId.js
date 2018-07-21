// @ts-check
const { getInfo } = require("ytdl-core");
const mongoose = require("mongoose");
const pm2 = require("pm2");
const URLModel = require("../models/urls");
const { MONGO_URI, MAX_IDs } = require("../settings");
mongoose.Promise = global.Promise;
mongoose.set("debug", true);

mongoose.connect(MONGO_URI).then(async () => {
  console.log("Connected");
  await init();
});

const getRelatedVideos = id => {
  return new Promise((resolve, reject) => {
    console.log("Querying for", id);
    getInfo(`https://youtube.com/watch?v=${id}`, (err, info) => {
      if (err) {
        resolve([]);
        console.log(err);
      } else {
        let videoIDArr = info.related_videos.filter(f => f.id).map(e => ({
          href: e.id
        }));
        resolve(videoIDArr);
      }
    });
  });
};

let cursor;

const init = async () => {
  if (!cursor) {
    cursor = await URLModel.find({})
      .sort("-createdAt")
      .cursor();
  }
  let doc = await cursor.next();
  if (doc) {
    try {
      let arr = await getRelatedVideos(doc.href);
      console.log(arr);
      await URLModel.insertMany(arr);
      let count = await URLModel.collection.countDocuments();
      console.log(`${count}th record`);
    } catch (e) {
      console.error(e);
    }
  } else {
    console.log(`All done!`);
    return;
  }
  await init();
};

process.on("unhandledRejection", (...args) => {
  console.error(`Process has failed with ${args}\n Restarting it`);
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
});
