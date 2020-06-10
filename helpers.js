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
  console.log("initializeMongoConnection");
  return new Promise((resolve, reject) => {
    client.connect((err, result) => {
      if (err) {
        console.log(
          "Erreur lors de la connexion à MongoDB: vérifier que l'adresse IP est bien whitelistée"
        );

        reject(err);
      } else {
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

const getRAMCPUAndDateFromLine = (line, d) => {
  const split = line.split(" ");
  const datetime = new Date(`${split[0]}T${split[1]}`.replace(",", ".")); // ISO format
  datetime.setHours(datetime.getHours() + 1); // heure française

  const percentages = split.filter((e) => e.includes("%"));
  const cpu = +percentages[0].replace("%", "");
  const ram = +percentages[1].replace("%", "");

  const result = {
    d,
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

const getCollectionSize = async () => {
  const stats = await performancesCollection.stats({ scale: 1024 });
  const { size } = stats;
  console.log(`Total used : ${_round(size / 1024)}MB/500MB`);
};

const closeConnection = () => client.close();

const deleteCollection = async () => {
  try {
    await initializeMongoConnection();
    await performancesCollection.deleteMany({}, options);
    closeConnection();
  } catch (error) {
    console.log(error);
  }
};

// Privates
const _getAllFiles = (folderPath) =>
  new Promise((resolve, reject) => {
    fs.readdir(folderPath, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });

const _getFilePath = (fileName) => path.join(process.env.FOLDER_PATH, fileName);

const _round = (number, precision = 2) => {
  return Math.round(number * 10 ** precision) / 10 ** precision;
};

const helpers = {
  getAllServerFiles,
  getReadingInterface,
  isLineFromLogInfoTechniqueJob,
  getRAMCPUAndDateFromLine,
  sendToDataBase,
  initializeMongoConnection,
  closeConnection,
  getLastDate,
  deleteCollection,
  getCollectionSize,
};

module.exports = helpers;
