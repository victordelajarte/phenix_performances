const helpers = require("./helpers");

main();

async function main() {
  try {
    await helpers.initializeMongoConnection();
  } catch (error) {
    console.error(error);
    return;
  }

  const files = await helpers.getAllServerFiles();

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const date = file.split(".")[1].replace("log_", "");
    console.log(`Traitement fichier ${index + 1}/${files.length} : ${date}`);

    const lines = helpers.getReadingInterface(file);
    const fileData = [];

    for await (line of lines) {
      const data = manageLine(line);
      if (!data) continue;
      fileData.push(data);
    }

    //console.log(fileData, fileData.length, fileData[fileData.length - 1]);
    await helpers.sendToDataBase(fileData);
    return;
  }
}

function manageLine(line) {
  if (helpers.isLineFromLogInfoTechniqueJob(line)) {
    return helpers.getRAMCPUAndDateFromLine(line);
  }
}
