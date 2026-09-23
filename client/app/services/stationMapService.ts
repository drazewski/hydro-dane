export interface StationMapMetadata {
  latitude: number;
  longitude: number;
}

type CompactStationMapFile = {
  v: number;
  d: Record<string, unknown[]>;
};

export interface StationMapData {
  stations: Record<number, StationMapMetadata>;
}

export const getStationMapData = async (): Promise<StationMapData> => {
  const response = await fetch('/data/map-stations.json');
  if (!response.ok) {
    throw new Error(`Unable to load station map data (${response.status})`);
  }

  const payload: unknown = await response.json();
  if (
    !payload ||
    typeof payload !== 'object' ||
    !('v' in payload) ||
    !('d' in payload) ||
    (payload as CompactStationMapFile).v !== 1 ||
    (payload as CompactStationMapFile).d === null ||
    Array.isArray((payload as CompactStationMapFile).d) ||
    typeof (payload as CompactStationMapFile).d !== 'object'
  ) {
    throw new Error('Unsupported station map format');
  }

  const compactData = payload as CompactStationMapFile;
  const stations = Object.entries(compactData.d).reduce<Record<number, StationMapMetadata>>(
    (result, [stationId, row]) => {
      const id = Number(stationId);
      const latitude = row[0];
      const longitude = row[1];

      if (
        Number.isInteger(id) &&
        typeof latitude === 'number' &&
        Number.isFinite(latitude) &&
        typeof longitude === 'number' &&
        Number.isFinite(longitude)
      ) {
        result[id] = {
          latitude,
          longitude,
        };
      }

      return result;
    },
    {}
  );

  return {
    stations,
  };
};
