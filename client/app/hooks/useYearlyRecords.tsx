// hooks/useYearlyRecords.ts
import { useMemo } from "react";    
import { useQuery } from "react-query";
import { YearlyRecordType, RecordDataType } from "../types/recordTypes";
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

  const availableYears = useMemo(() => sorted.map((r) => r.year), [sorted]);

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
    availableData: { years: availableYears, hasType },
    isLoading,
    isError,
  };
};
