const helpers = require("./helpers");

main();

async function main() {
  const files = await helpers.getAllServerFiles();

  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const date = file.split(".")[1].replace("log_", "");
    console.log(`Traitement fichier ${index + 1}/${files.length} : ${date}`);

    const lines = helpers.getReadingInterface(file);
    const results = [];

    for await (line of lines) {
      results.push(manageLine(line));
    }

    console.log(results, results.length, results[results.length - 1]);
    return;
  }
}

function manageLine(line) {
  if (helpers.isLineFromLogInfoTechniqueJob(line)) {
    return helpers.getRAMCPUAndDateFromLine(line);
  }
}
