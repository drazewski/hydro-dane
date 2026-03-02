import { create } from 'zustand';
import { RecordDataType, StationType } from '../types/recordTypes';

interface StationStoreType {
  station: StationType | null;
  yearFrom: string | null;
  yearTo: string | null;
  isMonthlyData: boolean;
  dataType: RecordDataType;
  aggregation: ('min' | 'avg' | 'max')[];
  setSelectedStation: (station: StationType | null) => void;
  setYearFrom: (year: string | null) => void;
  setYearTo: (year: string | null) => void;
  setIsMonthlyData: (isMonthly: boolean) => void;
  setSelectedDataType: (dataType: RecordDataType) => void;
  setAggregation: (aggregation: ('min' | 'avg' | 'max')[]) => void;
}

export const useStationStore = create<StationStoreType>((set) => ({
  station: null,
  yearFrom: null,
  yearTo: null,
  isMonthlyData: false,
  dataType: RecordDataType.level,
  aggregation: ['min','avg','max'],
  setSelectedStation: (newStation) => set(() => ({ station: newStation })),
  setYearFrom: (year) => set(() => ({ yearFrom: year })),
  setYearTo: (year) => set(() => ({ yearTo: year })),
  setIsMonthlyData: (isMonthly) => set(() => ({ isMonthlyData: isMonthly })),
  setSelectedDataType: (dataType) => set(() => ({ dataType })),
  setAggregation: (aggregation) => set(() => ({ aggregation })),
}));
