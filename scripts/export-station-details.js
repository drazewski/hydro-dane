#!/usr/bin/env node

/**
 * Konwertuje kody_stacji.csv do kompaktowego pliku statycznego używanego przez frontend.
 *
 * Format v1:
 * { "v": 1, "d": { "stationId": [yearEstablished, latitude, longitude, gaugeZero, riverKilometre] } }
 */
const fs = require("fs/promises");
const path = require("path");

const inputFile = path.resolve(__dirname, "../kody_stacji.csv");
const outputFile = path.resolve(__dirname, "../client/public/data/station-details.json");

const toNumberOrNull = (value) => {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
};

const toTextOrNull = (value) => {
  const normalized = value.trim();
  return normalized || null;
};

async function run() {
  const raw = await fs.readFile(inputFile, "utf8");
  const lines = raw.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  const [header, ...records] = lines;

  if (!header?.startsWith("LP.;Kod 9-znakowy;")) {
    throw new Error("Nieobsługiwany nagłówek pliku kody_stacji.csv");
  }

  const details = {};
  for (const line of records) {
    const columns = line.split(";");
    const stationId = columns[1]?.trim();
    if (!/^\d+$/.test(stationId ?? "")) {
      continue;
    }

    details[stationId] = [
      toNumberOrNull(columns[4] ?? ""),
      toTextOrNull(columns[5] ?? ""),
      toTextOrNull(columns[6] ?? ""),
      toNumberOrNull(columns[7] ?? ""),
      toNumberOrNull(columns[8] ?? ""),
    ];
  }

  await fs.writeFile(outputFile, JSON.stringify({ v: 1, d: details }), "utf8");
  process.stdout.write(`Wyeksportowano metrykę ${Object.keys(details).length} stacji do ${outputFile}\n`);
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
