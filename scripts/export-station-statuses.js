require("dotenv").config({ quiet: true });

const db = require("../app/models");
const { getStationMetadata, FRESH_DATA_YEAR } = require("../app/services/stationMetadata.service");

const run = async () => {
  const argYear = process.argv[2] ? Number.parseInt(process.argv[2], 10) : undefined;
  const freshYear = Number.isInteger(argYear) ? argYear : FRESH_DATA_YEAR;

  try {
    const stations = await getStationMetadata(freshYear);
    process.stdout.write(
      `${JSON.stringify({ freshYear, stations }, null, 2)}\n`
    );
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
};

run();
