const path = require("path");
const timeMapperObj = {
  0: "< 5 min",
  300: "> 5 min, < 10 min",
  600: "> 10 min, < 30 min",
  1800: "> 30 min"
};
module.exports = {
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/yt",
  timeMapperObj: timeMapperObj,
  timeMapper: time =>
    timeMapperObj[time] ? timeMapperObj[time] : "Other Larger videos",
  defaultFilePath: path.resolve(__dirname, "exports"),
  knownErrorMessages: [
    "The YouTube account associated with this video has been terminated due to multiple third-party notifications of copyright infringement.",
    "The video"
  ]
};
