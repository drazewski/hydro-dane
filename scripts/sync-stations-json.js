require("dotenv").config({ quiet: true });

const fs = require("fs/promises");
const path = require("path");
const { execFileSync } = require("child_process");

const db = require("../app/models");
const { getStationMetadata, FRESH_DATA_YEAR } = require("../app/services/stationMetadata.service");

const stationsJsonPath = path.resolve(__dirname, "../client/app/assets/data/stations.json");

const readJsonFile = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const readGitHeadStations = () => {
  try {
    const raw = execFileSync("git", ["show", `HEAD:${path.relative(process.cwd(), stationsJsonPath)}`], {
      cwd: path.resolve(__dirname, ".."),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const buildStationLabelMap = (payload) => {
  if (!payload || !Array.isArray(payload.stations)) {
    return new Map();
  }

  return new Map(
    payload.stations
      .filter((station) => typeof station?.id === "number")
      .map((station) => [
        station.id,
        {
          name: station.name,
          waterName: station.waterName,
        },
      ])
  );
};

const run = async () => {
  const argYear = process.argv[2] ? Number.parseInt(process.argv[2], 10) : undefined;
  const freshYear = Number.isInteger(argYear) ? argYear : FRESH_DATA_YEAR;

  try {
    const currentPayload = await readJsonFile(stationsJsonPath);
    const gitHeadPayload = readGitHeadStations();
    const currentLabels = buildStationLabelMap(currentPayload);
    const gitHeadLabels = buildStationLabelMap(gitHeadPayload);
    const stations = await getStationMetadata(freshYear);
    const payload = {
      freshYear,
      stations: stations.map((station) => ({
        id: station.id,
        name: gitHeadLabels.get(station.id)?.name || currentLabels.get(station.id)?.name || station.name,
        waterName:
          gitHeadLabels.get(station.id)?.waterName ||
          currentLabels.get(station.id)?.waterName ||
          station.waterName,
        hasTemperatureData: station.hasTemperatureData,
        hasFreshTemperatureData: station.hasFreshTemperatureData,
        hasFreshLevelData: station.hasFreshLevelData,
      })),
    };

    await fs.writeFile(stationsJsonPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    process.stdout.write(`Updated ${stationsJsonPath} for freshYear=${freshYear}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  } finally {
    await db.sequelize.close();
  }
};

run();
