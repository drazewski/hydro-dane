# AGENTS.md

Instructions for coding agents working in this repository.

## Project Overview

This is a full-stack hydrological data visualization project with a Node.js/Express + Sequelize backend and a Next.js frontend.

## Build, Test, and Lint Commands

### Backend

```bash
node server.js
nodemon server.js
```

There is no configured backend test suite.

### Frontend

```bash
cd client
npm run dev
npm run build
npm start
npm run lint
```

## Architecture

### Backend

- Entry point: `server.js`
- Models: `app/models/`
- Controllers: `app/controllers/`
- Routes: `app/routes/`
- Main hydrological table: `hydro_monthly_backup_2023`

### Frontend

- App Router code: `client/app/`
- Services: `client/app/services/`
- Components: `client/app/components/`
- State: Zustand + `react-query`
- UI: Mantine v7 and `@mantine/charts`

## Database Configuration

The project reads DB connection settings from `.env`.

Expected variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_hydro
DB_DIALECT=mysql
DB_USER=...
DB_PASSWORD=...
```

`db.sequelize.sync()` runs on server startup.

## Critical Data Conventions

### Hydrological Year

This project uses a hydrological year, not a plain calendar year.

- A hydrological year labeled `Y` contains:
  - November and December from calendar year `Y + 1`, stored in the app logic as belonging to corrected year `Y`
  - January through October of calendar year `Y`
- In practice, the backend assigns months `11` and `12` to the previous year for aggregation and filtering.
- This is intentional and correct for this project. Do not report this behavior as a bug.

Relevant implementation:

- `app/controllers/monthlyRecords.controller.js`
- `app/controllers/yearlyRecords.controller.js`

### Missing Data Is Often Expected

- Not all stations have data for all years.
- Temperature, flow, or level can be `null` for long stretches of time because the source data is incomplete.
- Large gaps in yearly temperature series are not automatically an application bug.
- Before flagging suspicious charts, first verify whether the source records for that station and hydrological year actually exist in the database.

### Yearly Aggregates Require Full Hydrological Years

- Yearly aggregates shown on yearly charts must be calculated only from complete hydrological years.
- A complete hydrological year means 12 distinct hydrological months for the given series.
- If a yearly series is missing even 1 month, the yearly aggregate must be returned as `null`.
- This rule applies equally to years at the beginning, in the middle, and at the end of the time series.
- Apply this rule to all yearly chart series: level, flow, and temperature, for min/avg/max separately.

### Sentinel Handling

- Water level sentinel: `9999` means missing data and should be treated as `null`.
- Temperature values above `50` are treated as invalid and should be filtered out.

## API Patterns

All endpoints use the `/api` prefix.

- Stations: `/api/stations`
- Monthly records: `/api/records/monthly/:stationId`
- Yearly records: `/api/records/yearly/:stationId`
- Temperature availability helper: `/api/records/yearly/withTemperature`

When filtering by year ranges, remember that the year is hydrological, not calendar.

## Frontend Environment

The frontend expects `NEXT_PUBLIC_VITE_BASE_URL` pointing to the backend API.

## Code Style

- Use ES6+ syntax.
- Use functional React components and hooks.
- Prefer clear, self-explanatory code over comments.
- Prefer Mantine styling patterns over ad hoc CSS when reasonable.

## Working Rule For Future Investigations

When a chart looks suspicious for a specific station/year:

1. Check whether the station actually has source records for that hydrological year.
2. Check whether missing values are expected gaps in IMGW data.
3. Only then inspect aggregation or frontend rendering logic.
