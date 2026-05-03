# Hydro Data Charts

**Hydro Data Charts** is a small data visualization project: a Node/Express + Sequelize API backed by MySQL that exposes hydrological monthly and yearly aggregates, and a Next.js front-end that visualizes station data with charts and filters.

---

## 🔧 Tech stack

- Backend: Node.js, Express, Sequelize, MySQL
- Frontend: Next.js, React, Mantine, Recharts
- HTTP client: Axios; data fetching: react-query

---

## 🚀 Features

- REST API to query stations, monthly records and yearly aggregates
- Data cleaning logic (sentinel values, month→year correction for Nov/Dec)
- Frontend UI for selecting station, years and chart type
- Aggregated yearly metrics (min/avg/max) for level, flow, temperature

---

## ⚙️ Requirements

- Node.js 18+ (or compatible)
- MySQL server and database credentials provided through environment variables

---

## 🧭 Setup (Local)

1. Clone the repo:

```bash
git clone <repo-url>
cd hydro
```

2. Install dependencies (server + client):

```bash
# server
npm install

# client
cd client
npm install
cd ..
```

3. Database: create a MySQL database and provide credentials through environment variables.
   - For local development, copy `.env.example` to `.env` and fill in your database credentials.

```bash
cp .env.example .env
```

   - Required variables:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

   - Optional variables:

```bash
DB_DIALECT=mysql
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
```

   - Example local `.env`:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_hydro
DB_USER=root
DB_PASSWORD=your_db_password
```

   - Example local start:

```bash
node server.js
```

**Importing data**

- The database must be populated with the hydrological data. Originally I use IMGW data (published as .csv files) from IMGW. You can download monthly CSV files from:
  https://danepubliczne.imgw.pl/data/dane_pomiarowo_obserwacyjne/dane_hydrologiczne/miesieczne/
- Import them into your MySQL database (`hydro_monthly`, `stations`) using tools such as `LOAD DATA INFILE`, custom import scripts, or a migration/import script of your choice.

- For testing how the app works and charts are created you can start with some example data. The repository includes an `example_data` folder containing sample CSV file(s) (e.g. `example_data/hydro_monthly_example.csv`) that you can import into a newly created database to explore the UI and charts.


4. Start the server and the frontend:

```bash
# both at once (recommended)
npm run dev:all
```

This uses `concurrently` to start the backend (nodemon) and the Next.js frontend in a single terminal, with color-coded output labels (`server` / `client`).

You can also start them separately:

```bash
# server only
npm run dev

# client only (new terminal)
npm run dev:client
```

The server defaults to port `8080` and the Next.js app runs on `3000`.

> Tip: set `NEXT_PUBLIC_VITE_BASE_URL` to `http://localhost:8080` for the frontend to point at the local API.

---

## 📡 API Reference

Base URL: `http://localhost:8080/api`

### Stations
- GET `/stations`
  - Returns all measurement stations.
  - Example: `curl http://localhost:8080/api/stations`

### Monthly records
- GET `/records/monthly/:stationId` — all monthly records for a station (month→year correction applied)
- GET `/records/monthly/:stationId/:year` — monthly records for a given year (compatible legacy endpoint)
- Range mode: `/records/monthly/:stationId?from=YYYY&to=YYYY` — returns records in the requested (corrected) year range

Example: `curl "http://localhost:8080/api/records/monthly/123?from=1990&to=2000"`

### Yearly aggregates
- GET `/records/yearly/:stationId` — returns yearly aggregates (min/avg/max for level/flow/temperature)
- GET `/records/yearly/:stationId?from=YYYY&to=YYYY` — filter by corrected year range
- GET `/records/yearly/:stationId/:year` — single-year aggregate
- GET `/records/yearly/withTemperature` — returns yearly temperature data for stations that have temperature in year 2000

Example: `curl "http://localhost:8080/api/records/yearly/123?from=1990&to=2000"`

---

## 🧪 Development notes

- The server calls `db.sequelize.sync()` on startup — tables will be created/checked automatically if models differ from DB.
- Monthly data processing trims sentinel values (e.g., level `9999`) and treats temperatures > 50°C as invalid (NULL).
- Calendar correction: months 11 (Nov) and 12 (Dec) are counted toward the previous year for aggregation logic.
- CORS whitelist is defined in `server.js` (localhost:3000, 8081, 5173). Update if you run the client on another origin.

---

## 🧭 Frontend

- Located in `/client` (Next.js app)
- To run: `cd client && npm run dev`
- Frontend expects `NEXT_PUBLIC_VITE_BASE_URL` pointing to your API base URL (e.g. `http://localhost:8080`).

---

## 💡 Contributing

Feel free to open issues or PRs. If you plan to make breaking changes to the DB schema, consider adding migrations instead of relying only on `sequelize.sync()`.

**Hosting**

- For Render, add the same `DB_*` variables in the service environment settings.

---

## 📜 License

This project is licensed under **GPL-3.0-only** (see `package.json`).

---

**Author:** Łukasz Drazewski
