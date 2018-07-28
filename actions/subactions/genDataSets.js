// @ts-check
const MetaModel = require("../../models/metaDataModel");
const { timeMapper } = require("../../settings");
const keywords = async limit => {
  let responsesFromServer = await MetaModel.aggregate([
    {
      $project: {
        keywords: true,
        view_count: true
      }
    },
    {
      $unwind: {
        path: "$keywords",
        preserveNullAndEmptyArrays: false
      }
    },
    {
      $group: {
        _id: "$keywords",
        averageViews: { $avg: "$view_count" }
      }
    },
    {
      $sort: {
        averageViews: -1
      }
    },
    {
      $limit: limit
    }
  ]).allowDiskUse(true);
  return responsesFromServer.map(res => ({
    tag: res._id.slice(0, 10),
    avgViews: res.averageViews
  }));
};

const channel = async limit => {
  let responsesFromServer = await MetaModel.aggregate([
    {
      $project: {
        "author.id": true,
        "author.name": true,
        view_count: true
      }
    },
    {
      $group: {
        _id: {
          unique_slug: "$author.id",
          name: "$author.name"
        },
        avgViews: { $avg: "$view_count" }
      }
    },
    {
      $sort: {
        avgViews: -1
      }
    },
    {
      $limit: limit
    }
  ]).allowDiskUse(true);
  return responsesFromServer.map(response => ({
    tag: response._id.name,
    avgViews: response.avgViews
  }));
};

const timeBased = async () => {
  let data = await MetaModel.aggregate([
    {
      $project: {
        view_count: true,
        length_seconds: true,
        title: true
      }
    },
    {
      $bucket: {
        groupBy: "$length_seconds",
        boundaries: [0, 300, 600, 1800],
        default: "Other",
        output: {
          avgViews: { $avg: "$view_count" }
        }
      }
    }
  ]).allowDiskUse(true);
  return data.map(dat => ({
    tag: timeMapper(dat._id),
    avgViews: dat.avgViews
  }));
};

module.exports = {
  keywords,
  channel,
  time: timeBased
};
