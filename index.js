const helpers = require("./helpers");

main();

async function main() {
  console.time("Fill Database");
  try {
    await helpers.initializeMongoConnection();
    console.timeLog("Fill Database");
  } catch (error) {
    console.error(error);
    return;
  }

  const lastDate = await helpers.getLastDate();
  console.timeLog("Fill Database", "lastDate", lastDate);

  const files = await helpers.getAllServerFiles();

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const date = file.split(".")[1].replace("log_", "");
    console.log(`Traitement fichier ${index + 1}/${files.length} : ${date}`);
    if (date < lastDate) continue;

    const lines = helpers.getReadingInterface(file);
    const fileData = [];
    for await (line of lines) {
      const data = manageLine(line, date);
      if (!data) continue;
      fileData.push(data);
    }
    try {
      await helpers.sendToDataBase(fileData, date);
    } catch (error) {
      console.error(error);
      return;
    }
  }
  await helpers.getCollectionSize();

  await helpers.closeConnection();
  console.timeEnd("Fill Database");

  console.log("Bravo, c'est fini !");
  process.exit(0);
}

function manageLine(line, date) {
  if (helpers.isLineFromLogInfoTechniqueJob(line)) {
    return helpers.getRAMCPUAndDateFromLine(line, date);
  }
}
