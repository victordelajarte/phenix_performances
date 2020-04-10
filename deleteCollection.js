const helpers = require("./helpers");

main();

async function main() {
  console.time("Delete");
  await helpers.deleteCollection();
  console.timeEnd("Delete");
  console.log("Data deleted");
  process.exit(0);
}
