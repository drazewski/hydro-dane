export interface MonthlyRecordType {
  station_id: number;
  year: number;
  h_month: number;
  type: 1 | 2 | 3;
  level: number;
  flow: number;
  temperature: number;
  month: number;
}

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
  station_id: number;
  year: number;
  month: number
  minLevel?: number;
  maxLevel?: number;
  avgLevel?: number;
  minFlow?: number;  
  maxFlow?: number;
  avgFlow?: number;
  minTemperature?: number;
  maxTemperature?: number;
  avgTemperature?: number;
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
}

export enum RecordDataTypeLabel {
  minLevel = 'minimalny poziom',
  avgLevel = 'średni poziom',
  maxLevel = 'maksymalny poziom',
  minFlow = 'minimalny przepływ',
  avgFlow = 'średni przepływ',
  maxFlow = 'maksymalny przepływ',
  minTemperature = 'temperatura minimalna',
  avgTemperature = 'temperatura średnia',
  maxTemperature = 'temperatura maksymalna',
}
