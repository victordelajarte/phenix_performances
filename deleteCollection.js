const helpers = require("./helpers");

main();

async function main() {
  await helpers.deleteCollection();
  console.log("Data deleted");
  process.exit(0);
}
