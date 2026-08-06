#!/usr/bin/env node

/**
 * Eksportuje dane z MySQL do plików statycznych używanych przez frontend.
 *
 * Format v1 (kolejność wartości jest częścią kontraktu):
 *   monthly/<stationId>.json: { "v": 1, "d": [[year, month, minL, avgL, maxL, minF, avgF, maxF, minT, avgT, maxT]] }
 *   yearly/<stationId>.json:  { "v": 1, "d": [[year, minL, avgL, maxL, minF, avgF, maxF, minT, avgT, maxT]] }
 *
 * null oznacza brak danych. XI i XII są eksportowane do poprzedniego roku
 * hydrologicznego, tak samo jak w aktualnym API. Roczne średnie są ważone
 * liczbą dni w miesiącach źródłowych.
 */
require("dotenv").config({ quiet: true });

const fs = require("fs/promises");
const path = require("path");
const db = require("../app/models");
const { aggregate, daysInMonth } = require("./static-data-aggregation");

const outputRoot = path.resolve(__dirname, "../client/public/data");
const monthlyOutputDir = path.join(outputRoot, "monthly");
const yearlyOutputDir = path.join(outputRoot, "yearly");

const valueKeys = ["level", "flow", "temperature"];
const statisticKeys = ["min", "avg", "max"];

const round = (value) => (value == null ? null : Number(Number(value).toFixed(2)));

const normalizeValue = (key, value) => {
  if (value == null) return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  if (key === "level" && number === 9999) return null;
  if (key === "temperature" && number > 50) return null;
  return number;
};

const hydrologicalYear = (year, month) => (month === 11 || month === 12 ? year - 1 : year);

const emptyStatistics = () =>
  Object.fromEntries(valueKeys.map((key) => [key, Object.fromEntries(statisticKeys.map((stat) => [stat, []]))]));

const emptyMonthSets = () =>
  Object.fromEntries(
    valueKeys.map((key) => [
      key,
      Object.fromEntries(statisticKeys.map((stat) => [stat, new Set()])),
    ])
  );

const toCompactValues = (statistics) =>
  valueKeys.flatMap((key) => statisticKeys.map((statistic) => round(aggregate(statistics[key][statistic], statistic))));

const toYearlyCompactValues = (statistics, months) =>
  valueKeys.flatMap((key) =>
    statisticKeys.map((statistic) =>
      months[key][statistic].size === 12 ? round(aggregate(statistics[key][statistic], statistic)) : null
    )
  );

const getStatistic = (type) => ({ 1: "min", 2: "avg", 3: "max" }[Number(type)]);

const writeJson = (filePath, payload) => fs.writeFile(filePath, JSON.stringify(payload), "utf8");

async function run() {
  try {
    const [rows, stationRows] = await Promise.all([
      db.hydro_monthly.findAll({
        attributes: ["station_id", "year", "month", "h_month", "type", "level", "flow", "temperature"],
        raw: true,
        order: [["station_id", "ASC"], ["year", "ASC"], ["month", "ASC"], ["type", "ASC"]],
      }),
      db.stations.findAll({ attributes: ["id"], raw: true }),
    ]);

    const stations = new Map();
    for (const station of stationRows) {
      const stationId = Number(station.id);
      if (Number.isInteger(stationId)) {
        stations.set(stationId, { monthly: new Map(), yearly: new Map() });
      }
    }

    for (const row of rows) {
      const stationId = Number(row.station_id);
      const month = Number(row.month);
      const statistic = getStatistic(row.type);
      if (!Number.isInteger(stationId) || !Number.isInteger(month) || month < 1 || month > 12 || !statistic) {
        continue;
      }

      const year = hydrologicalYear(Number(row.year), month);
      if (!Number.isInteger(year)) continue;

      const station = stations.get(stationId) ?? { monthly: new Map(), yearly: new Map() };
      stations.set(stationId, station);

      const monthKey = `${year}-${month}`;
      const monthly = station.monthly.get(monthKey) ?? { year, month, statistics: emptyStatistics() };
      station.monthly.set(monthKey, monthly);

      const yearly = station.yearly.get(year) ?? { statistics: emptyStatistics(), months: emptyMonthSets() };
      station.yearly.set(year, yearly);

      for (const key of valueKeys) {
        const value = normalizeValue(key, row[key]);
        if (value == null) continue;

        monthly.statistics[key][statistic].push(value);
        yearly.statistics[key][statistic].push(
          statistic === "avg" ? { value, weight: daysInMonth(Number(row.year), month) } : value
        );
        // h_month jest kluczem używanym przez aktualne API do walidacji pełnego roku.
        // NULL nie może liczyć się jako miesiąc (tak samo jak w COUNT(DISTINCT ...)).
        const hydrologicalMonth = Number(row.h_month);
        if (Number.isInteger(hydrologicalMonth)) {
          yearly.months[key][statistic].add(hydrologicalMonth);
        }
      }
    }

    await Promise.all([
      fs.mkdir(monthlyOutputDir, { recursive: true }),
      fs.mkdir(yearlyOutputDir, { recursive: true }),
    ]);

    let monthlyRecords = 0;
    let yearlyRecords = 0;
    const files = [];

    for (const [stationId, station] of stations) {
      const monthly = [...station.monthly.values()]
        .sort((a, b) => a.year - b.year || a.month - b.month)
        .map((entry) => [entry.year, entry.month, ...toCompactValues(entry.statistics)]);
      const yearly = [...station.yearly.entries()]
        .sort(([leftYear], [rightYear]) => leftYear - rightYear)
        .map(([year, entry]) => [year, ...toYearlyCompactValues(entry.statistics, entry.months)]);

      const monthlyFile = `${stationId}.json`;
      const yearlyFile = `${stationId}.json`;
      await Promise.all([
        writeJson(path.join(monthlyOutputDir, monthlyFile), { v: 1, d: monthly }),
        writeJson(path.join(yearlyOutputDir, yearlyFile), { v: 1, d: yearly }),
      ]);

      files.push(stationId);
      monthlyRecords += monthly.length;
      yearlyRecords += yearly.length;
    }

    await writeJson(path.join(outputRoot, "manifest.json"), {
      v: 1,
      generatedAt: new Date().toISOString(),
      stations: files.sort((a, b) => a - b),
    });

    process.stdout.write(
      `Exported ${files.length} stations, ${monthlyRecords} monthly records and ${yearlyRecords} yearly records to ${outputRoot}\n`
    );
  } finally {
    await db.sequelize.close();
  }
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});
