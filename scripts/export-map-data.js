#!/usr/bin/env node

/**
 * Buduje lekki indeks stacji używany przez mapę.
 *
 * Format v1:
 * { "v": 1, "d": { "stationId": [latitude, longitude] } }
 */
const fs = require("fs/promises");
const path = require("path");

const dataRoot = path.resolve(__dirname, "../client/public/data");
const stationDetailsFile = path.join(dataRoot, "station-details.json");
const outputFile = path.join(dataRoot, "map-stations.json");

const readJson = async (filePath, fallback = null) => {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
};

const parseCoordinate = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;

  if (!value.trim()) return null;

  const parts = value
    .trim()
    .replace(",", ".")
    .split(/\s+/)
    .map(Number);

  if (parts.length === 1) {
    return Number.isFinite(parts[0]) ? parts[0] : null;
  }
  if (parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) {
    return null;
  }

  const [degrees, minutes, seconds] = parts;
  const sign = degrees < 0 ? -1 : 1;
  return sign * (Math.abs(degrees) + minutes / 60 + seconds / 3600);
};

const exportMapData = async () => {
  const stationDetails = await readJson(stationDetailsFile, { d: {} });
  const details = stationDetails?.v === 1 && stationDetails.d && typeof stationDetails.d === "object"
    ? stationDetails.d
    : {};

  const rows = Object.entries(details)
    .map(([stationId, detailsRow]) => {
      if (!Array.isArray(detailsRow)) return null;

      const latitude = parseCoordinate(detailsRow[1]);
      const longitude = parseCoordinate(detailsRow[2]);
      if (latitude === null || longitude === null) return null;

      return [stationId, [latitude, longitude]];
    });

  const data = Object.fromEntries(
    rows
      .filter((row) => row !== null)
      .sort(([leftId], [rightId]) => Number(leftId) - Number(rightId))
  );
  await fs.writeFile(outputFile, JSON.stringify({ v: 1, d: data }), "utf8");
  process.stdout.write(`Wyeksportowano dane mapy dla ${Object.keys(data).length} stacji do ${outputFile}\n`);
};

if (require.main === module) {
  exportMapData().catch((error) => {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exitCode = 1;
  });
}

module.exports = { exportMapData, parseCoordinate };
