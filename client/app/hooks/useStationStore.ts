import { create } from 'zustand';
import { RecordDataType, StationType } from '../types/recordTypes';

interface StationStoreType {
  station: StationType | null;
  yearFrom: string | null;
  yearTo: string | null;
  isMonthlyData: boolean;
  monthlyMode: 'all' | 'single';
  selectedMonth: string | null;
  dataType: RecordDataType;
  aggregation: ('min' | 'avg' | 'max')[];
  trendLine: 'none' | 'min' | 'avg' | 'max';
  setSelectedStation: (station: StationType | null) => void;
  setYearFrom: (year: string | null) => void;
  setYearTo: (year: string | null) => void;
  setIsMonthlyData: (isMonthly: boolean) => void;
  setMonthlyMode: (mode: 'all' | 'single') => void;
  setSelectedMonth: (month: string | null) => void;
  setSelectedDataType: (dataType: RecordDataType) => void;
  setAggregation: (aggregation: ('min' | 'avg' | 'max')[]) => void;
  setTrendLine: (trendLine: 'none' | 'min' | 'avg' | 'max') => void;
}

export const useStationStore = create<StationStoreType>((set) => ({
  station: null,
  yearFrom: null,
  yearTo: null,
  isMonthlyData: false,
  monthlyMode: 'all',
  selectedMonth: null,
  dataType: RecordDataType.level,
  aggregation: ['min','avg','max'],
  trendLine: 'none',
  setSelectedStation: (newStation) => set(() => ({
    station: newStation,
    yearFrom: null,
    yearTo: null,
    monthlyMode: 'all',
    selectedMonth: null,
    trendLine: 'none',
  })),
  setYearFrom: (year) => set(() => ({ yearFrom: year })),
  setYearTo: (year) => set(() => ({ yearTo: year })),
  setIsMonthlyData: (isMonthly) => set(() => ({ isMonthlyData: isMonthly })),
  setMonthlyMode: (mode) => set(() => ({ monthlyMode: mode })),
  setSelectedMonth: (month) => set(() => ({ selectedMonth: month })),
  setSelectedDataType: (dataType) => set(() => ({ dataType })),
  setAggregation: (aggregation) => set(() => ({ aggregation })),
  setTrendLine: (trendLine) => set(() => ({ trendLine })),
}));
