// @ts-check
const mongoose = require("mongoose");
const URLModel = require("../models/urls");
const MetaModel = require("../models/metaDataModel");

const { MONGO_URI, MAX_IDs } = require("../settings");
mongoose.Promise = global.Promise;
mongoose.set("debug", true);

mongoose.connect(MONGO_URI).then(async () => {
  console.log("Connected");
  await init();
});

let cursor;

const init = async () => {
  if (!cursor) {
    cursor = await MetaModel.find({}, { parentRef: 1 }).cursor();
  }
  let doc = await cursor.next();
  if (doc) {
    try {
      let urldoc = await URLModel.findByIdAndRemove(doc.parentRef);
      let count = await URLModel.collection.countDocuments();
      console.log(`${count} documents still left`);
    } catch (e) {
      console.dir("ran into an error", e);
    }
  } else {
    console.log("All done!");
    return;
  }
  await init();
};
