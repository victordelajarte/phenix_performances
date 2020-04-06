const fs = require("fs");
const path = require("path");
const readline = require("readline");
const dotEnvExpand = require("dotenv-expand");

dotEnvExpand(require("dotenv").config());

const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let performancesCollection;

const options = {
  w: "majority",
  j: true,
  wtimeout: 1000 * 30,
};

const initializeMongoConnection = () => {
  client.connect();
  console.log("initializeMongoConnection");
  return new Promise((resolve, reject) => {
    client.connect((err, result) => {
      if (err) reject(err);
      else {
        const database = client.db("phenix-performances");
        performancesCollection = database.collection("performance");
        resolve(result);
      }
    });
  });
};

const getAllServerFiles = () =>
  new Promise(async (resolve, reject) => {
    try {
      let result = (await _getAllFiles(process.env.FOLDER_PATH)).filter((f) =>
        f.startsWith("PhenixService")
      );

      result.sort();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });

const getReadingInterface = (fileName) => {
  // console.log("getReadingInterface : " + fileName);
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
  const date = splittedLine[0];
  const datetime = date + "T" + splittedLine[1].replace(",", "."); // ISO format
  const percentages = splittedLine.filter((e) => e.includes("%"));
  const cpu = +percentages[0].replace("%", "");
  const ram = +percentages[1].replace("%", "");

  const result = {
    d: date,
    dt: datetime,
    c: cpu,
    r: ram,
  };
  return result;
};

const getLastDate = async () => {
  const lastFile = await performancesCollection
    .find()
    .sort({ d: -1 })
    .limit(1)
    .project({ d: 1, _id: 0 })
    .toArray();
  return lastFile[0]
    ? lastFile[0].d
    : new Date(2014, 1, 1).toISOString().split("T")[0];
};

const sendToDataBase = async (fileData, date) => {
  console.log("sendToDataBase : " + date);
  await performancesCollection.deleteMany({ d: date }, options);
  return performancesCollection.insertMany(fileData, options);
};

const closeConnection = () => client.close();

// Privates
const _getAllFiles = (folderPath) =>
  new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });

const _getFilePath = (fileName) => path.join(process.env.FOLDER_PATH, fileName);

const helpers = {
  getAllServerFiles,
  getReadingInterface,
  isLineFromLogInfoTechniqueJob,
  getRAMCPUAndDateFromLine,
  sendToDataBase,
  initializeMongoConnection,
  closeConnection,
  getLastDate,
};

module.exports = helpers;
