const db = require("../models");
const Record = db.hydro_monthly; // tabela miesięczna
const { Sequelize } = db;
const Op = db.Sequelize.Op;

/**
 * Wspólny fragment walidacji query z zakresem lat
 */
function parseRange(req) {
  const from = req.query.from !== undefined ? parseInt(req.query.from, 10) : undefined;
  const to = req.query.to !== undefined ? parseInt(req.query.to, 10) : undefined;

  if ((from !== undefined && Number.isNaN(from)) || (to !== undefined && Number.isNaN(to))) {
    return { error: "Invalid from/to" };
  }
  if ((from !== undefined && to === undefined) || (from === undefined && to !== undefined)) {
    return { error: "Both 'from' and 'to' are required" };
  }
  if (from !== undefined && to !== undefined && from > to) {
    return { error: "'from' cannot be greater than 'to'" };
  }
  return { from, to };
}

/**
 * Atrybut obliczeniowy: skorygowany rok
 * (XI–XII => poprzedni rok)
 */
const correctedYearSql = `CASE WHEN month IN (11,12) THEN year - 1 ELSE year END`;

const tempValid = `temperature <= 50`;
const levelValid = `level IS NOT NULL AND level != 9999`;
const flowValid = `flow IS NOT NULL`;

const completeYearAggregate = (aggregateFn, valueExpression, validCondition) =>
  Sequelize.literal(
    `CASE WHEN COUNT(DISTINCT CASE WHEN ${validCondition} THEN h_month END) = 12 THEN ${aggregateFn}(${valueExpression}) END`
  );

/**
 * Zestaw agregacji rocznych z warunkami po typie (1=min, 2=avg, 3=max)
 * i z uwzględnieniem sentinelowych wartości -> NULL.
 */
const yearlyAttributes = [
  // klucz grupowania (skorygowany rok)
  [Sequelize.literal(correctedYearSql), "year"],
  ["station_id", "stationId"],

  // LEVEL
  [completeYearAggregate("MIN", `CASE WHEN type=1 THEN NULLIF(level, 9999) END`, `type=1 AND ${levelValid}`), "minLevel"],
  [completeYearAggregate("MAX", `CASE WHEN type=3 THEN NULLIF(level, 9999) END`, `type=3 AND ${levelValid}`), "maxLevel"],
  [completeYearAggregate("AVG", `CASE WHEN type=2 THEN NULLIF(level, 9999) END`, `type=2 AND ${levelValid}`), "avgLevel"],

  // FLOW (jeśli masz sentinel dla flow, wstaw NULLIF(flow, XXX))
  [completeYearAggregate("MIN", `CASE WHEN type=1 THEN flow END`, `type=1 AND ${flowValid}`), "minFlow"],
  [completeYearAggregate("MAX", `CASE WHEN type=3 THEN flow END`, `type=3 AND ${flowValid}`), "maxFlow"],
  [completeYearAggregate("AVG", `CASE WHEN type=2 THEN flow END`, `type=2 AND ${flowValid}`), "avgFlow"],

  // TEMPERATURE — NOWE: odrzucamy wszystko > 50 °C
  [completeYearAggregate("MIN", `CASE WHEN type=1 AND ${tempValid} THEN temperature END`, `type=1 AND ${tempValid}`), "minTemperature"],
  [completeYearAggregate("MAX", `CASE WHEN type=3 AND ${tempValid} THEN temperature END`, `type=3 AND ${tempValid}`), "maxTemperature"],
  [completeYearAggregate("AVG", `CASE WHEN type=2 AND ${tempValid} THEN temperature END`, `type=2 AND ${tempValid}`), "avgTemperature"],
];

const formatToNumber = (value) =>
  value != null ? Number.parseFloat(Number(value).toFixed(2)) : null;

/**
 * GET /api/records/yearly/:id?from=YYYY&to=YYYY
 * - bez from/to: zwraca pełny zakres rocznych agregatów
 * - z from/to: filtr po skorygowanym roku
 */
exports.findAll = (req, res) => {
  const stationId = parseInt(req.params.id, 10);
  if (Number.isNaN(stationId)) {
    return res.status(400).send({ message: "Invalid station id" });
  }

  const { from, to, error } = parseRange(req);
  if (error) return res.status(400).send({ message: error });

  const where = { station_id: stationId };

  // gdy mamy zakres, filtrujemy po skorygowanym roku (literal + between)
  const havingOrWhereYear =
    from !== undefined && to !== undefined
      ? {
          [Op.and]: Sequelize.where(
            Sequelize.literal(correctedYearSql),
            { [Op.between]: [from, to] }
          ),
        }
      : {};

  Record.findAll({
    attributes: yearlyAttributes,
    group: ["station_id", Sequelize.literal(correctedYearSql)],
    // filtr po skorygowanym roku w sekcji "where" z literalem (Sequelize.where)
    // dorzucamy go przez "havingOrWhereYear" (który tworzy [Op.and] z literalem)
    // Uwaga: w SQLite/MySQL/PG to podejście działa; jeśli używasz innego dialektu, można przenieść do HAVING.
    where: { ...where, ...havingOrWhereYear },
    order: [
      ["station_id", "ASC"],
      [Sequelize.literal("year"), "ASC"],
    ],
    raw: true,
  })
    .then((rows) => {
      // rows są już zagregowane; upewnijmy się, że liczby są… liczbami ;)
      const out = rows.map((r) => ({
        year: Number(r.year),
        stationId: Number(r.stationId),
        minLevel: formatToNumber(r.minLevel),
        avgLevel: formatToNumber(r.avgLevel),
        maxLevel: formatToNumber(r.maxLevel),
        minFlow: formatToNumber(r.minFlow),
        avgFlow: formatToNumber(r.avgFlow),
        maxFlow: formatToNumber(r.maxFlow),
        minTemperature: formatToNumber(r.minTemperature),
        avgTemperature: formatToNumber(r.avgTemperature),
        maxTemperature: formatToNumber(r.maxTemperature),
      }));
      res.send(out);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving yearly records.",
      });
    });
};

/**
 * GET /api/records/yearly/:id/:year
 * - zwraca agregaty tylko dla jednego roku
 */
exports.findByYear = (req, res) => {
  const stationId = parseInt(req.params.id, 10);
  const year = parseInt(req.params.year, 10);

  if (Number.isNaN(stationId) || Number.isNaN(year)) {
    return res.status(400).send({ message: "Invalid station id or year" });
  }

  const where = { station_id: stationId };

  Record.findAll({
    where,
    attributes: yearlyAttributes,
    group: ["station_id", Sequelize.literal(correctedYearSql)],
    // warunek: skorygowany rok = :year
    where: {
      ...where,
      [Op.and]: Sequelize.where(Sequelize.literal(correctedYearSql), year),
    },
    raw: true,
  })
    .then((rows) => {
      const r = rows[0];
      if (!r) return res.send([]);
      const out = {
        year: Number(r.year),
        stationId: Number(r.stationId),
        minLevel: formatToNumber(r.minLevel),
        avgLevel: formatToNumber(r.avgLevel),
        maxLevel: formatToNumber(r.maxLevel),
        minFlow: formatToNumber(r.minFlow),
        avgFlow: formatToNumber(r.avgFlow),
        maxFlow: formatToNumber(r.maxFlow),
        minTemperature: formatToNumber(r.minTemperature),
        avgTemperature: formatToNumber(r.avgTemperature),
        maxTemperature: formatToNumber(r.maxTemperature),
      };
      res.send([out]); // spójnie z findAll (zwracamy tablicę)
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving yearly records.",
      });
    });
};

exports.findAllWithTemperatureIn2000 = async (req, res) => {
  try {
    // 1. Znajdź stacje, które w 2000 roku mają avgTemperature != null
    const rows2000 = await Record.findAll({
      attributes: [
        "station_id",
        [Sequelize.literal(correctedYearSql), "year"],
        [Sequelize.fn("AVG", Sequelize.literal(`CASE WHEN type=2 AND ${tempValid} THEN temperature END`)), "avgTemperature"],
      ],
      where: {
        year: 2000,
      },
      group: ["station_id", Sequelize.literal(correctedYearSql)],
      raw: true,
    });

    const validStationIds = rows2000
      .filter((r) => r.avgTemperature != null)
      .map((r) => r.station_id);

    if (validStationIds.length === 0) {
      return res.send([]); // żadna stacja nie ma temperatury w 2000
    }

    // 2. Pobierz roczne dane dla wszystkich lat, tylko tych stacji
    const allRows = await Record.findAll({
      where: {
        station_id: { [Op.in]: validStationIds },
      },
      attributes: [
        ['station_id', 'stationId'],
        ...yearlyAttributes,
      ],
      group: ["station_id", Sequelize.literal(correctedYearSql)],
      order: [
        ["station_id", "ASC"],
        [Sequelize.literal("year"), "ASC"],
      ],
      raw: true,
    });

    const filteredRows = allRows.filter(r => r.avgTemperature != null);

    // 3. Sformatuj wynik
    const out = filteredRows.map((r) => ({
      stationId: Number(r.stationId),
      year: Number(r.year),
      minTemperature: formatToNumber(r.minTemperature),
      avgTemperature: formatToNumber(r.avgTemperature),
      maxTemperature: formatToNumber(r.maxTemperature),
    }));

    res.send(out);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving yearly records.",
    });
  }
};
