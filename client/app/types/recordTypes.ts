export type YearlyRecordType = {
  year: number;
  minLevel: number | null;
  avgLevel: number | null;
  maxLevel: number | null;
  minFlow: number | null;
  avgFlow: number | null;
  maxFlow: number | null;
  minTemperature: number | null;
  avgTemperature: number | null;
  maxTemperature: number | null;
};

export interface MonthlyStructuredRecordType {
  year: number;
  month: number;
  minLevel: number | null;
  maxLevel: number | null;
  avgLevel: number | null;
  minFlow: number | null;
  maxFlow: number | null;
  avgFlow: number | null;
  minTemperature: number | null;
  maxTemperature: number | null;
  avgTemperature: number | null;
}

export interface StationType {
  id: number;
  name: string;
  waterName: string;
  fullName?: string;
  hasTemperatureData: boolean;
  hasFreshTemperatureData: boolean;
  hasFreshLevelData: boolean;
}

export enum RecordDataType {
  flow = 'flow',
  level = 'level',
  temperature = 'temperature'
}

export interface AvailableDataType {
  years: number[];
  dataType: RecordDataType[];
  yearsByType?: Partial<Record<RecordDataType, number[]>>;
}

export enum RecordDataTypeLabel {
  minLevel = 'minimalny poziom',
  avgLevel = 'średni poziom',
  maxLevel = 'maksymalny poziom',
  trendMinLevel = 'trend minimalnego poziomu',
  trendAvgLevel = 'trend średniego poziomu',
  trendMaxLevel = 'trend maksymalnego poziomu',
  minFlow = 'minimalny przepływ',
  avgFlow = 'średni przepływ',
  maxFlow = 'maksymalny przepływ',
  trendMinFlow = 'trend minimalnego przepływu',
  trendAvgFlow = 'trend średniego przepływu',
  trendMaxFlow = 'trend maksymalnego przepływu',
  minTemperature = 'temperatura minimalna',
  avgTemperature = 'temperatura średnia',
  maxTemperature = 'temperatura maksymalna',
  trendMinTemperature = 'trend temperatury minimalnej',
  trendAvgTemperature = 'trend temperatury średniej',
  trendMaxTemperature = 'trend temperatury maksymalnej',
}
