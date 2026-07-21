// hooks/useYearlyRecords.ts
import { useMemo } from "react";    
import { useQuery } from "react-query";
import { YearlyRecordType, RecordDataType, AvailableDataType } from "../types/recordTypes";
import { getYearlyRecords } from "../services/recordService";
import { useStationStore } from "./useStationStore";

export const useYearlyRecords = (stationId: number, isMonthlyData: boolean) => {
  const yearFrom = useStationStore((s) => s.yearFrom);
  const yearTo = useStationStore((s) => s.yearTo);

  const { data, isLoading, isError } = useQuery(
    ["yearlyRecords", stationId],
    (): Promise<YearlyRecordType[]> => getYearlyRecords(stationId),
    { enabled: !!stationId && !isMonthlyData }
  );

  const sorted = useMemo(() => {
    return (data ?? []).slice().sort((a, b) => a.year - b.year);
  }, [data]);

  const availableData = useMemo<AvailableDataType>(() => {
    const yearsByType: Partial<Record<RecordDataType, number[]>> = {
      [RecordDataType.level]: [],
      [RecordDataType.flow]: [],
      [RecordDataType.temperature]: [],
    };

    const dataType: RecordDataType[] = [];

    sorted.forEach((record) => {
      if (record.minLevel != null || record.avgLevel != null || record.maxLevel != null) {
        if (!dataType.includes(RecordDataType.level)) dataType.push(RecordDataType.level);
        yearsByType[RecordDataType.level]?.push(record.year);
      }
      if (record.minFlow != null || record.avgFlow != null || record.maxFlow != null) {
        if (!dataType.includes(RecordDataType.flow)) dataType.push(RecordDataType.flow);
        yearsByType[RecordDataType.flow]?.push(record.year);
      }
      if (record.minTemperature != null || record.avgTemperature != null || record.maxTemperature != null) {
        if (!dataType.includes(RecordDataType.temperature)) dataType.push(RecordDataType.temperature);
        yearsByType[RecordDataType.temperature]?.push(record.year);
      }
    });

    return {
      years: sorted.map((r) => r.year),
      dataType,
      yearsByType: {
        [RecordDataType.level]: Array.from(new Set(yearsByType[RecordDataType.level] ?? [])),
        [RecordDataType.flow]: Array.from(new Set(yearsByType[RecordDataType.flow] ?? [])),
        [RecordDataType.temperature]: Array.from(new Set(yearsByType[RecordDataType.temperature] ?? [])),
      },
    };
  }, [sorted]);

  const filteredData = useMemo(() => {
    if (!yearFrom || !yearTo) return sorted;
    const from = Number(yearFrom);
    const to = Number(yearTo);
    return sorted.filter((d) => d.year >= from && d.year <= to);
  }, [sorted, yearFrom, yearTo]);

  const hasType = (t: RecordDataType) => {
    switch (t) {
      case RecordDataType.level:
        return sorted.some((r) => r.minLevel != null || r.avgLevel != null || r.maxLevel != null);
      case RecordDataType.flow:
        return sorted.some((r) => r.minFlow != null || r.avgFlow != null || r.maxFlow != null);
      case RecordDataType.temperature:
        return sorted.some((r) => r.minTemperature != null || r.avgTemperature != null || r.maxTemperature != null);
      default:
        return false;
    }
  };

  return {
    data: filteredData,
    availableData: { ...availableData, hasType },
    isLoading,
    isError,
  };
};
