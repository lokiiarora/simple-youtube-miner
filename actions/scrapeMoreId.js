const { getInfo } = require("ytdl-core");
const mongoose = require("mongoose");
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

const init = async () => {
  let cursor = await URLModel.find({})
    .sort("-createdAt")
    .stream();
  for (
    let doc = await cursor.next();
    await cursor.hasNext();
    doc = await cursor.next()
  ) {
    try {
      let arr = await getRelatedVideos(doc.href);
      console.log(arr);
      await URLModel.insertMany(arr);
      let count = await URLModel.collection.countDocuments();
      if (count >= MAX_IDs) {
        process.exit(0);
      }
    } catch (e) {
      console.error(e);
    }
  }
};

process.on("unhandledRejection", console.error);
