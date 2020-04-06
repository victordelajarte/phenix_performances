const helpers = require("./helpers");

describe("getAllServerFiles", async () => {
  const files = await helpers.getAllServerFiles();

  test("Should get files", () => {
    expect(files.length).toBeGreaterThan(0);
  });
  test("Random file should begin with PhenixService", () => {
    expect(
      _getRandomElementFromArray(files).startsWith("PhenixService")
    ).toBeTruthy();
  });

  test("Random file should not begin with PhenixService", () => {
    expect(
      _getRandomElementFromArray(files).startsWith("PhenixService")
    ).toBeTruthy();
  });
});

describe("isLineFromLogInfoTechniqueJob", () => {
  test("Empty line, should fail", () => {
    expect(helpers.isLineFromLogInfoTechniqueJob("")).toBeFalsy();
  });
  test("Incorrect line, should fail", () => {
    expect(
      helpers.isLineFromLogInfoTechniqueJob(
        "2020-01-01 00:02:56,595 INFO PhenixService LogInfotechniqueJob : CPU = 80.39% et RAM = 71.83%"
      )
    ).toBeFalsy();
  });
  test("Correct line, should succeed", () => {
    expect(
      helpers.isLineFromLogInfoTechniqueJob(
        "2020-01-01 00:02:56,595 INFO PhenixService LogInfoTechniqueJob : CPU = 80.39% et RAM = 71.83%"
      )
    ).toBeTruthy();
  });
});

const _getRandomElementFromArray = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};
