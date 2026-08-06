import { StationDetailsType } from '../types/recordTypes';

type CompactStationDetailsFile = {
  v: number;
  d: Record<string, unknown[]>;
};

const toNumberOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const toTextOrNull = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

export const getStationDetails = async (): Promise<Record<number, StationDetailsType>> => {
  const response = await fetch('/data/station-details.json');
  if (!response.ok) {
    throw new Error(`Unable to load station details (${response.status})`);
  }

  const payload: unknown = await response.json();
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('v' in payload) ||
    !('d' in payload) ||
    (payload as CompactStationDetailsFile).v !== 1 ||
    typeof (payload as CompactStationDetailsFile).d !== 'object'
  ) {
    throw new Error('Unsupported station details format');
  }

  return Object.entries((payload as CompactStationDetailsFile).d).reduce<Record<number, StationDetailsType>>(
    (result, [stationId, row]) => {
      const id = Number(stationId);
      if (!Number.isInteger(id) || !Array.isArray(row) || row.length !== 5) {
        return result;
      }

      result[id] = {
        yearEstablished: toNumberOrNull(row[0]),
        latitude: toTextOrNull(row[1]),
        longitude: toTextOrNull(row[2]),
        gaugeZero: toNumberOrNull(row[3]),
        riverKilometre: toNumberOrNull(row[4]),
      };
      return result;
    },
    {}
  );
};
