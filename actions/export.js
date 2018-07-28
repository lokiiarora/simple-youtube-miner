// @ts-check
const mongoose = require("mongoose");
const { MONGO_URI, defaultFilePath } = require("../settings");
const meow = require("meow");
const { genImage, chalkDefaults } = require("./subactions/common");
const genDataSets = require("./subactions/genDataSets");
mongoose.Promise = global.Promise;
mongoose
  .connect(
    MONGO_URI,
    { useNewUrlParser: true }
  )
  .then(async () => {
    const app = meow(
      `
			Usage
				$ node actions/export.js

			Options
				--limit -l Number of records to compute and extrapolate from DB
		`,
      {
        flags: {
          limit: {
            type: "string",
            default: "10",
            alias: "l"
          }
        }
      }
    );
    // @ts-ignore
    await init(app.flags);
    process.exit(0);
  });

const init = async ({ limit }) => {
  if (limit === "") {
    limit = "10";
  }
  let realLimit = parseInt(limit, 10);
  try {
    console.log(chalkDefaults.info("Generating keywords dataset"));
    let keyWordsDataSet = await genDataSets.keywords(realLimit);
    console.log(chalkDefaults.info("Generating keywords graph"));
    await genImage(
      keyWordsDataSet,
      "keywordsSet",
      "# Views in millions",
      1000000
    );
    console.log(chalkDefaults.info("Generating channel based dataset"));
    let channelDataSet = await genDataSets.channel(realLimit);
    console.log(chalkDefaults.info("Generating channel based graphs"));
    await genImage(
      channelDataSet,
      "channelSet",
      "# Views in millions",
      1000000
    );
    console.log(chalkDefaults.info("Generating time based dataset"));
    let timeBasedDataSet = await genDataSets.time();
    console.log(chalkDefaults.info("Generating time based graph"));
    await genImage(timeBasedDataSet, "timeSet", "# Views in Millions", 1000000);
    console.log(chalkDefaults.info(`Saved your files to ${defaultFilePath}`));
    console.log(chalkDefaults.success(`All done!`));
  } catch (e) {
    console.error(e);
    console.log(chalkDefaults.error("Something has gone wrong"));
  }
  return;
};

// const genByPlayTime = async limit => {
//   if (!limit) {
//     limit = 100;
//   }
//   const shortTime = await MetaModel.aggregate([
//     {
// $project: {
//   view_count: true,
//   length_seconds: true
// }
//     },
//     {
//       $match: {
//         length_seconds: { $gt: 300, $lt: 600 }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         avgViews: { $avg: "$view_count" }
//       }
//     }
//   ]).allowDiskUse(true);
//   const medTime = await MetaModel.aggregate([
//     {
//       $project: {
//         view_count: true,
//         length_seconds: true
//       }
//     },
//     {
//       $match: {
//         length_seconds: { $gt: 600, $lt: 1800 }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         avgViews: { $avg: "$view_count" }
//       }
//     }
//   ]).allowDiskUse(true);

//   const longTime = await MetaModel.aggregate([
//     {
//       $project: {
//         view_count: true,
//         length_seconds: true
//       }
//     },
//     {
//       $match: {
//         length_seconds: { $gt: 1800 }
//       }
//     },
//     {
//       $group: {
//         _id: null,
//         avgViews: { $avg: "$view_count" }
//       }
//     }
//   ]);

//   return {
//     short: shortTime[0].avgViews,
//     medium: medTime[0].avgViews,
//     long: longTime[0].avgViews
//   };
// };

// const genAvgViewCountOnTheBasisOfChannel = async limit => {
//   if (!limit) {
//     limit = 100;
//   }

//   let ratings = await MetaModel.aggregate([
//     {
//       $project: {
//         "author.id": true,
//         "author.name": true,
//         view_count: true
//       }
//     },
//     {
//       $group: {
//         _id: {
//           unique_slug: "$author.id",
//           name: "$author.name"
//         },
//         avgViews: { $avg: "$view_count" }
//       }
//     },
//     {
//       $sort: {
//         avgViews: -1
//       }
//     },
//     {
//       $limit: limit
//     }
//   ]).allowDiskUse(true);
//   return ratings.map(rating => ({
//     identification: rating._id,
//     rating: rating.avgViews / 1000000
//   }));
// };

// const genAvgViewCountOnTheBasisOfKeywords = async limit => {
//   if (!limit) {
//     limit = 100;
//   }
//   let res = await MetaModel.aggregate([
//     {
//       $project: {
//         keywords: true,
//         view_count: true
//       }
//     },
//     {
//       $unwind: {
//         path: "$keywords",
//         preserveNullAndEmptyArrays: false
//       }
//     },
//     {
//       $group: {
//         _id: "$keywords",
//         averageViews: { $avg: "$view_count" }
//       }
//     },
//     {
//       $sort: {
//         averageViews: -1
//       }
//     },
//     {
//       $limit: limit
//     }
//   ]).allowDiskUse(true);
//   return res.map(rating => ({
//     tag: rating._id,
//     avgViews: rating.averageViews / 1000000
//   }));
// };
