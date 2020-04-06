const fs = require("fs");
const path = require("path");
const readline = require("readline");

const FOLDER_PATH = "C:\\Users\\Victor\\Desktop\\rattrapages\\logs";

const getAllServerFiles = () =>
  new Promise(async (resolve, reject) => {
    try {
      let result = (await _getAllFiles(FOLDER_PATH)).filter((f) =>
        f.startsWith("PhenixService")
      );

      result.sort();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });

const getReadingInterface = (fileName) => {
  console.log("getReadingInterface : " + fileName);
  return readline.createInterface({
    input: fs.createReadStream(_getFilePath(fileName), "utf-8"),
    crlfDelay: Infinity,
  });
};

const isLineFromLogInfoTechniqueJob = (line) => {
  return line.includes("LogInfoTechniqueJob : CPU");
};

const getRAMCPUAndDateFromLine = (line) => {
  const splittedLine = line.split(" ");
  const date = splittedLine[0] + "T" + splittedLine[1].replace(",", "."); // ISO format

  const percentages = splittedLine.filter((e) => e.includes("%"));
  const cpu = +percentages[0].replace("%", "");
  const ram = +percentages[1].replace("%", "");

  const result = {
    d: date,
    c: cpu,
    r: ram,
  };
  return result;
};

// Privates
const _getAllFiles = (folderPath) =>
  new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });

const _getFilePath = (fileName) => path.join(FOLDER_PATH, fileName);

const helpers = {
  getAllServerFiles,
  getReadingInterface,
  isLineFromLogInfoTechniqueJob,
  getRAMCPUAndDateFromLine,
};

module.exports = helpers;
