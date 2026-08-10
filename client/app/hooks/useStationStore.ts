import { create } from 'zustand';
import { RecordDataType, StationType } from '../types/recordTypes';

interface StationStoreType {
  station: StationType | null;
  yearFrom: string | null;
  yearTo: string | null;
  isMonthlyData: boolean;
  monthlyMode: 'all' | 'single';
  chartView: 'line' | 'heatmap';
  selectedMonth: string | null;
  dataType: RecordDataType;
  aggregation: ('min' | 'avg' | 'max')[];
  trendLine: 'none' | 'min' | 'avg' | 'max';
  stationPickerAttention: number;
  stationPickerEditing: boolean;
  setSelectedStation: (station: StationType | null) => void;
  setYearFrom: (year: string | null) => void;
  setYearTo: (year: string | null) => void;
  setIsMonthlyData: (isMonthly: boolean) => void;
  setMonthlyMode: (mode: 'all' | 'single') => void;
  setChartView: (view: 'line' | 'heatmap') => void;
  setSelectedMonth: (month: string | null) => void;
  setSelectedDataType: (dataType: RecordDataType) => void;
  setAggregation: (aggregation: ('min' | 'avg' | 'max')[]) => void;
  setTrendLine: (trendLine: 'none' | 'min' | 'avg' | 'max') => void;
  requestStationPickerAttention: () => void;
  startStationPickerEditing: () => void;
}

export const useStationStore = create<StationStoreType>((set) => ({
  station: null,
  yearFrom: null,
  yearTo: null,
  isMonthlyData: false,
  monthlyMode: 'all',
  chartView: 'line',
  selectedMonth: null,
  dataType: RecordDataType.level,
  aggregation: ['min','avg','max'],
  trendLine: 'none',
  stationPickerAttention: 0,
  stationPickerEditing: false,
  setSelectedStation: (newStation) => set(() => ({
    station: newStation,
    yearFrom: null,
    yearTo: null,
    monthlyMode: 'all',
    chartView: 'line',
    selectedMonth: null,
    trendLine: 'none',
    stationPickerEditing: false,
  })),
  setYearFrom: (year) => set(() => ({ yearFrom: year })),
  setYearTo: (year) => set(() => ({ yearTo: year })),
  setIsMonthlyData: (isMonthly) => set(() => ({ isMonthlyData: isMonthly })),
  setMonthlyMode: (mode) => set(() => ({ monthlyMode: mode })),
  setChartView: (chartView) => set(() => ({ chartView })),
  setSelectedMonth: (month) => set(() => ({ selectedMonth: month })),
  setSelectedDataType: (dataType) => set(() => ({ dataType })),
  setAggregation: (aggregation) => set(() => ({ aggregation })),
  setTrendLine: (trendLine) => set(() => ({ trendLine })),
  requestStationPickerAttention: () =>
    set((state) => ({ stationPickerAttention: state.stationPickerAttention + 1 })),
  startStationPickerEditing: () => set(() => ({ stationPickerEditing: true })),
}));
