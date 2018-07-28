// @ts-check
const ChartjsNode = require("chartjs-node");
const chalk = require("chalk");
const { defaultFilePath, knownErrorMessages } = require("../../settings");
const path = require("path");
const fs = require("fs");

const genImage = async (dataset, filename, mainLabel, scale) => {
  if (!scale) {
    scale = 1;
  }
  let size = dataset.length * 100;
  let labels = dataset.map(d => d.tag);
  let data = dataset.map(d => d.avgViews / scale);
  const chart = new ChartjsNode(size, size, 1);
  await chart.drawChart({
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: mainLabel,
          data: data,
          backgroundColor: dataset.map(genRandomColor),
          borderColor: dataset.map(genRandomColor),
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  });
  if (!fs.existsSync(defaultFilePath)) {
    fs.mkdirSync(defaultFilePath);
  }
  await chart.writeImageToFile(
    "image/jpeg",
    path.resolve(defaultFilePath, `${filename}.jpeg`)
  );
  return true;
};

const genRandomColor = () =>
  `rgba(${Math.round(Math.random() * 256)},${Math.round(
    Math.random() * 256
  )}, ${Math.round(Math.random() * 256)},${Math.random().toFixed(1)})`;

const chalkDefaults = {
  info: chalk.default.bold.yellow,
  error: chalk.default.bgRedBright.bold.white,
  success: chalk.default.bgGreen.black
};

const errorPlexer = ({ message }) => {
  let result = false;
  knownErrorMessages.map(messageKnown => {
    result =
      result ||
      message.includes(messageKnown) ||
      message.startsWith(messageKnown);
  });
  return result;
};

module.exports = { genRandomColor, genImage, chalkDefaults, errorPlexer };
