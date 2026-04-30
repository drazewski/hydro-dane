import { useMemo } from 'react';
import stationsData from '../assets/data/stations.json';
import { StationType } from '../types/recordTypes';

interface UseStationsType {
  stations: StationType[];
  freshYear: number;
}

export const useStations = (): UseStationsType => {
  const stations = useMemo(
    () => {
      const data = Array.isArray(stationsData.stations) ? stationsData.stations : [];
      return data.reduce((acc: StationType[], curr) => {
        if (typeof curr.waterName !== 'string' || typeof curr.name !== 'string') return acc;
        if (curr.waterName.includes('Jez.')) return acc;
        const waterName = curr.waterName.replace(/[0-9()]/g, '').trim();
        const stationName = curr.name.trim();
        const fullName = `${waterName} (${stationName})`;
        acc.push({
          id: curr.id,
          name: stationName,
          fullName,
          waterName,
          hasTemperatureData: Boolean(curr.hasTemperatureData),
          hasFreshTemperatureData: Boolean(curr.hasFreshTemperatureData),
          hasFreshLevelData: Boolean(curr.hasFreshLevelData),
        });
        return acc;
      }, []);
    },
    []
  );

  return {
    freshYear:
      typeof stationsData.freshYear === 'number' && Number.isFinite(stationsData.freshYear)
        ? stationsData.freshYear
        : 2024,
    stations: [...stations].sort((a, b) => a.waterName.localeCompare(b.waterName)),
  };
};
