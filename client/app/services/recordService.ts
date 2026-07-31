
import { MonthlyStructuredRecordType, YearlyRecordType } from '../types/recordTypes';

type CompactDataFile = {
  v: number;
  d: unknown[][];
};

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, '');

// Blob is optional locally, so local development can still use the exported files.
const localMonthlyDataBaseUrl = '/data/monthly';
const monthlyDataBaseUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_MONTHLY_DATA_BASE_URL || localMonthlyDataBaseUrl
);
const yearlyDataBaseUrl = '/data/yearly';

const getStaticData = async (path: string): Promise<CompactDataFile> => {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load static data (${response.status})`);
  }

  const data: unknown = await response.json();
  if (
    !data ||
    typeof data !== 'object' ||
    !('v' in data) ||
    !('d' in data) ||
    (data as { v: unknown }).v !== 1 ||
    !Array.isArray((data as { d: unknown }).d)
  ) {
    throw new Error('Unsupported static data format');
  }

  return data as CompactDataFile;
};

const toNumberOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const toInteger = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) ? value : null;

export const getMonthlyRecords = async (
  stationId: number,
  yearOrFrom?: number,
  yearTo?: number
): Promise<MonthlyStructuredRecordType[]> => {
  const fileName = `${stationId}.json`;
  let payload: CompactDataFile;

  try {
    payload = await getStaticData(`${monthlyDataBaseUrl}/${fileName}`);
  } catch (error) {
    if (monthlyDataBaseUrl === localMonthlyDataBaseUrl) {
      throw error;
    }

    payload = await getStaticData(`${localMonthlyDataBaseUrl}/${fileName}`);
  }

  const { d } = payload;
  const records = d.reduce<MonthlyStructuredRecordType[]>((result, row) => {
    const year = toInteger(row[0]);
    const month = toInteger(row[1]);
    if (year == null || month == null || month < 1 || month > 12 || row.length !== 11) {
      return result;
    }

    if (
      (typeof yearOrFrom === 'number' && typeof yearTo === 'number' && (year < yearOrFrom || year > yearTo)) ||
      (typeof yearOrFrom === 'number' && yearTo === undefined && year !== yearOrFrom)
    ) {
      return result;
    }

    result.push({
      year,
      month,
      minLevel: toNumberOrNull(row[2]),
      avgLevel: toNumberOrNull(row[3]),
      maxLevel: toNumberOrNull(row[4]),
      minFlow: toNumberOrNull(row[5]),
      avgFlow: toNumberOrNull(row[6]),
      maxFlow: toNumberOrNull(row[7]),
      minTemperature: toNumberOrNull(row[8]),
      avgTemperature: toNumberOrNull(row[9]),
      maxTemperature: toNumberOrNull(row[10]),
    });
    return result;
  }, []);

  return records;
};

export const getYearlyRecords = async (
  stationId: number,
  from?: number,
  to?: number,
): Promise<YearlyRecordType[]> => {
  const { d } = await getStaticData(`${yearlyDataBaseUrl}/${stationId}.json`);
  return d.reduce<YearlyRecordType[]>((result, row) => {
    const year = toInteger(row[0]);
    if (year == null || row.length !== 10 || (typeof from === 'number' && typeof to === 'number' && (year < from || year > to))) {
      return result;
    }

    result.push({
      year,
      minLevel: toNumberOrNull(row[1]),
      avgLevel: toNumberOrNull(row[2]),
      maxLevel: toNumberOrNull(row[3]),
      minFlow: toNumberOrNull(row[4]),
      avgFlow: toNumberOrNull(row[5]),
      maxFlow: toNumberOrNull(row[6]),
      minTemperature: toNumberOrNull(row[7]),
      avgTemperature: toNumberOrNull(row[8]),
      maxTemperature: toNumberOrNull(row[9]),
    });
    return result;
  }, []);
};
