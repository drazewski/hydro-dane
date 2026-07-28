import { useMemo } from "react";
import { useQuery } from "react-query";
import { getMonthlyRecords } from "../services/recordService";
import { useStationStore } from "./useStationStore";
import {
  AvailableDataType,
  MonthlyStructuredRecordType,
  RecordDataType,
} from "../types/recordTypes";

const initialAvailableData: AvailableDataType = {
  years: [],
  dataType: [],
  yearsByType: {},
};

export const useMonthlyRecords = (stationId: number, isMonthlyData: boolean) => {
  const yearFrom = useStationStore((s) => s.yearFrom);
  const yearTo = useStationStore((s) => s.yearTo);
  const monthlyMode = useStationStore((s) => s.monthlyMode);
  const selectedMonth = useStationStore((s) => s.selectedMonth);

  const { data, isLoading, isError } = useQuery(
    ["monthlyRecords", stationId],
    (): Promise<MonthlyStructuredRecordType[]> => getMonthlyRecords(stationId),
    { enabled: !!stationId && isMonthlyData }
  );

  const sourceData = useMemo(() => {
    if (!data) return [];
    if (monthlyMode !== 'single' || !selectedMonth) {
      return data;
    }

    return data.filter((record) => record.month === Number(selectedMonth));
  }, [data, monthlyMode, selectedMonth]);

  const allSortedData = useMemo(() => {
    return [...(data ?? [])].sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month;
      }
      return a.year - b.year;
    });
  }, [data]);

  const availableData = useMemo(
    () =>
      sourceData.reduce(
        (acc: AvailableDataType, curr: MonthlyStructuredRecordType) => {
          if (!acc.years.includes(curr.year)) {
            acc.years.push(curr.year);
          }

          const hasFlow = curr.minFlow != null || curr.avgFlow != null || curr.maxFlow != null;
          if (!acc.dataType.includes(RecordDataType.flow) && hasFlow) {
            acc.dataType.push(RecordDataType.flow);
          }
          if (hasFlow) {
            acc.yearsByType ??= {};
            acc.yearsByType[RecordDataType.flow] ??= [];
            if (!acc.yearsByType[RecordDataType.flow]?.includes(curr.year)) {
              acc.yearsByType[RecordDataType.flow]?.push(curr.year);
            }
          }

          const hasLevel = curr.minLevel != null || curr.avgLevel != null || curr.maxLevel != null;
          if (!acc.dataType.includes(RecordDataType.level) && hasLevel) {
            acc.dataType.push(RecordDataType.level);
          }
          if (hasLevel) {
            acc.yearsByType ??= {};
            acc.yearsByType[RecordDataType.level] ??= [];
            if (!acc.yearsByType[RecordDataType.level]?.includes(curr.year)) {
              acc.yearsByType[RecordDataType.level]?.push(curr.year);
            }
          }

          if (
            !acc.dataType.includes(RecordDataType.temperature) &&
            (curr.minTemperature != null || curr.avgTemperature != null || curr.maxTemperature != null)
          ) {
            acc.dataType.push(RecordDataType.temperature);
          }
          if (curr.minTemperature != null || curr.avgTemperature != null || curr.maxTemperature != null) {
            acc.yearsByType ??= {};
            acc.yearsByType[RecordDataType.temperature] ??= [];
            if (!acc.yearsByType[RecordDataType.temperature]?.includes(curr.year)) {
              acc.yearsByType[RecordDataType.temperature]?.push(curr.year);
            }
          }

          return acc;
        },
        { years: [], dataType: [], yearsByType: {} }
      ) ?? initialAvailableData,
    [sourceData]
  );

  const sortedData = useMemo(() => {
    return [...sourceData].sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month;
      }
      return a.year - b.year;
    });
  }, [sourceData]);

  const fullData = allSortedData;

  const filteredData = useMemo(() => {
    if (!yearFrom || !yearTo) return sortedData;
    const from = Number(yearFrom);
    const to = Number(yearTo);
    return sortedData.filter((d) => d.year >= from && d.year <= to);
  }, [sortedData, yearFrom, yearTo]);

  return {
    data: filteredData,
    fullData,
    availableData: {
      ...availableData,
      years: [...availableData.years].sort((a, b) => a - b),
      yearsByType: Object.fromEntries(
        Object.entries(availableData.yearsByType ?? {}).map(([key, years]) => [
          key,
          [...(years ?? [])].sort((a, b) => a - b),
        ])
      ),
    },
    isLoading,
    isError,
  };
};
