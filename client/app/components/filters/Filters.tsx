import { Checkbox, ComboboxItem, Loader, Radio, SegmentedControl, Select, Text, useMantineColorScheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useStationStore } from "../../hooks/useStationStore";
import { RecordDataType, StationType } from "../../types/recordTypes";
import styles from "./filters.module.css";
import { useEffect, useMemo, useRef } from "react";
import { useMonthlyRecords } from "../../hooks/useMonthlyRecords";
import { useYearlyRecords } from "../../hooks/useYearlyRecords";
import { trackDataSelected } from "../analytics/analyticsEvents";

interface Props {
  selectedStation: StationType;
}

const Filters = ({ selectedStation }: Props) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const DATA_TYPE_OPTIONS = [
    { label: "Stan wody", value: RecordDataType.level },
    { label: "Przepływ", value: RecordDataType.flow },
    { label: isMobile ? "Temp. wody" : "Temperatura wody", value: RecordDataType.temperature },
  ];

  const yearFrom = useStationStore((s) => s.yearFrom);
  const yearTo = useStationStore((s) => s.yearTo);
  const setYearFrom = useStationStore((s) => s.setYearFrom);
  const setYearTo = useStationStore((s) => s.setYearTo);
  const monthlyMode = useStationStore((s) => s.monthlyMode);
  const chartView = useStationStore((s) => s.chartView);
  const selectedMonth = useStationStore((s) => s.selectedMonth);
  const setMonthlyMode = useStationStore((s) => s.setMonthlyMode);
  const setChartView = useStationStore((s) => s.setChartView);
  const setSelectedMonth = useStationStore((s) => s.setSelectedMonth);
  const aggregations = useStationStore((state) => state.aggregation);
  const trendLine = useStationStore((state) => state.trendLine);
  const dataType = useStationStore((state) => state.dataType);
  const isMonthlyData = useStationStore((state) => state.isMonthlyData);
  const setMonthlyData = useStationStore((state) => state.setIsMonthlyData);
  const setSelectedDataType = useStationStore((state) => state.setSelectedDataType);
  const setAggregation = useStationStore((state) => state.setAggregation);
  const setTrendLine = useStationStore((state) => state.setTrendLine);
  const { data: monthlyData, availableData: monthlyAvailable, isLoading: loadingMonthly, isError: errorMonthly } = useMonthlyRecords(selectedStation.id, isMonthlyData);
  const { data: yearlyData, availableData: yearlyAvailable, isLoading: loadingYearly, isError: errorYearly } = useYearlyRecords(selectedStation.id, isMonthlyData);

  const isLoading = isMonthlyData ? loadingMonthly : loadingYearly;
  const isError = isMonthlyData ? errorMonthly : errorYearly;
  const isHeatmap = isMonthlyData && monthlyMode === 'all' && chartView === 'heatmap';
  const selectedHeatmapAggregation = aggregations.includes('avg')
    ? 'avg'
    : aggregations.includes('max')
      ? 'max'
      : aggregations.includes('min')
        ? 'min'
        : 'avg';
  const previousScopeKeyRef = useRef<string | null>(null);
  const monthOptions = useMemo(
    () => [
      { value: '1', label: 'Styczeń' },
      { value: '2', label: 'Luty' },
      { value: '3', label: 'Marzec' },
      { value: '4', label: 'Kwiecień' },
      { value: '5', label: 'Maj' },
      { value: '6', label: 'Czerwiec' },
      { value: '7', label: 'Lipiec' },
      { value: '8', label: 'Sierpień' },
      { value: '9', label: 'Wrzesień' },
      { value: '10', label: 'Październik' },
      { value: '11', label: 'Listopad' },
      { value: '12', label: 'Grudzień' },
    ],
    []
  );

  const sortedYears = useMemo(() => {
    const available = isMonthlyData ? monthlyAvailable : yearlyAvailable;
    const years = available.yearsByType?.[dataType] ?? available.years;
    return [...years].sort((a, b) => a - b);
  }, [dataType, isMonthlyData, monthlyAvailable, yearlyAvailable]);

  useEffect(() => {
    if (isLoading || sortedYears.length === 0) {
      return;
    }

    const minYear = String(sortedYears[0]);
    const maxYear = String(sortedYears[sortedYears.length - 1]);
    const currentScopeKey = `${selectedStation.id}:${isMonthlyData ? "monthly" : "yearly"}:${dataType}:${monthlyMode}:${selectedMonth ?? "all"}`;
    const currentFromValid = yearFrom != null && sortedYears.includes(Number(yearFrom));
    const currentToValid = yearTo != null && sortedYears.includes(Number(yearTo));
    const scopeChanged = previousScopeKeyRef.current !== currentScopeKey;

    previousScopeKeyRef.current = currentScopeKey;

    if (scopeChanged || !currentFromValid || !currentToValid || Number(yearFrom) > Number(yearTo)) {
      setYearFrom(minYear);
      setYearTo(maxYear);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataType, isLoading, isMonthlyData, monthlyMode, selectedMonth, selectedStation.id, setYearFrom, setYearTo, sortedYears, yearFrom, yearTo]);

  useEffect(() => {
    if (!isMonthlyData || monthlyMode !== 'single' || selectedMonth) {
      return;
    }

    setSelectedMonth('1');
  }, [isMonthlyData, monthlyMode, selectedMonth, setSelectedMonth]);

  useEffect(() => {
    if (!isMonthlyData || monthlyMode === 'single') {
      setChartView('line');
    }
  }, [isMonthlyData, monthlyMode, setChartView]);

  useEffect(() => {
    if (!isHeatmap) return;

    if (trendLine !== 'none') {
      setTrendLine('none');
    }
    if (aggregations.length !== 1) {
      setAggregation([selectedHeatmapAggregation]);
    }
  }, [aggregations.length, isHeatmap, selectedHeatmapAggregation, setAggregation, setTrendLine, trendLine]);

  useEffect(() => {
    if (isLoading || yearFrom || sortedYears.length === 0) {
      return;
    }

    const hasLevel = isMonthlyData
      ? monthlyData.some((r) => r.avgLevel != null)
      : yearlyData.some((r) => r.avgLevel != null);

    setSelectedDataType(hasLevel ? RecordDataType.level : RecordDataType.flow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isMonthlyData, monthlyData, yearlyData, yearFrom, sortedYears.length]);

  useEffect(() => {
    if (trendLine === 'none' || aggregations.includes(trendLine)) {
      return;
    }

    setTrendLine('none');
  }, [aggregations, setTrendLine, trendLine]);

  const yearsOptions = useMemo(
    () => sortedYears.map((y) => ({ label: y.toString(), value: y.toString() })),
    [sortedYears]
  );

  const yearsOptionsFrom = useMemo(() => yearsOptions, [yearsOptions]);

  const yearsOptionsTo = useMemo(() => {
    const from = yearFrom ? Number(yearFrom) : undefined;
    return from ? yearsOptions.filter((opt) => Number(opt.value) >= from) : yearsOptions;
  }, [yearsOptions, yearFrom]);

  const handleYearFromChange = (_: string | null, option: ComboboxItem) => {
    const newFrom = option?.value ?? null;
    if (!newFrom) return;
    if (yearTo && Number(yearTo) < Number(newFrom)) setYearTo(newFrom);
    setYearFrom(newFrom);
  };

  const handleYearToChange = (_: string | null, option: ComboboxItem) => {
    const newTo = option?.value ?? null;
    if (!newTo) return;
    if (!yearFrom) { setYearFrom(newTo); }
    else if (Number(newTo) < Number(yearFrom)) { setYearTo(yearFrom); return; }
    setYearTo(newTo);
  };

  const handleDataTypeChange = (value: string | null) => {
    if (!value || value === dataType) {
      return;
    }

    const nextDataType = value as RecordDataType;
    setSelectedDataType(nextDataType);
    trackDataSelected(selectedStation, nextDataType);
  };

  const handleMonthlyModeChange = (value: string) => {
    const nextMode = value as 'all' | 'single';
    setMonthlyMode(nextMode);
    if (nextMode === 'single' && !selectedMonth) {
      setSelectedMonth('1');
    }
  };

  const handleDataAggregationModeChange = (value: string) => {
    setMonthlyData(value === 'monthly');
  };

  const trendOptions = useMemo(
    () => [
      { value: 'none', label: 'Bez trendu' },
      ...(aggregations.includes('max') ? [{ value: 'max', label: isMobile ? 'Trend maks.' : 'Trend maksymalnych' }] : []),
      ...(aggregations.includes('avg') ? [{ value: 'avg', label: isMobile ? 'Trend śr.' : 'Trend średnich' }] : []),
      ...(aggregations.includes('min') ? [{ value: 'min', label: isMobile ? 'Trend min.' : 'Trend minimalnych' }] : []),
    ],
    [aggregations, isMobile]
  );

  const handleTrendToggle = (enabled: boolean) => {
    if (!enabled) {
      setTrendLine('none');
      return;
    }

    if (trendLine !== 'none') {
      return;
    }

    if (aggregations.includes('avg')) {
      setTrendLine('avg');
    } else if (aggregations.includes('max')) {
      setTrendLine('max');
    } else if (aggregations.includes('min')) {
      setTrendLine('min');
    }
  };

  const trendSummary = useMemo(() => {
    if (trendLine === 'none') {
      return null;
    }

    const sourceData = isMonthlyData ? monthlyData : yearlyData;
    const useYearAsX = !isMonthlyData || monthlyMode === 'single';

    if (!useYearAsX) {
      return null;
    }

    const capitalizedType = dataType.charAt(0).toUpperCase() + dataType.slice(1);
    const field = `${trendLine}${capitalizedType}`;
    const unit = dataType === RecordDataType.temperature ? '°C' : dataType === RecordDataType.level ? 'cm' : 'm3/s';

    const points = (sourceData ?? [])
      .map((item) => {
        const rawValue = item[field as keyof typeof item];
        const value = typeof rawValue === 'number' ? rawValue : null;
        return value == null || typeof item.year !== 'number' ? null : { x: item.year, y: value };
      })
      .filter((point): point is { x: number; y: number } => point !== null);

    if (points.length < 2) {
      return null;
    }

    const count = points.length;
    const sumX = points.reduce((acc, point) => acc + point.x, 0);
    const sumY = points.reduce((acc, point) => acc + point.y, 0);
    const sumXY = points.reduce((acc, point) => acc + point.x * point.y, 0);
    const sumXX = points.reduce((acc, point) => acc + point.x * point.x, 0);
    const denominator = count * sumXX - sumX * sumX;

    if (denominator === 0) {
      return null;
    }

    const slope = (count * sumXY - sumX * sumY) / denominator;
    return `${slope >= 0 ? '+' : ''}${slope.toFixed(Math.abs(slope) < 1 ? 2 : 1)} ${unit} /rok`;
  }, [dataType, isMonthlyData, monthlyData, monthlyMode, trendLine, yearlyData]);

  return (
    <div>
      {isLoading ? (
        <Loader color="blue" size="xl" type="bars" className={styles.loader} />
      ) : isError ? (
        <Text c="red">Błąd ładowania danych. Spróbuj ponownie.</Text>
      ) : (
        <div className={styles.container}>
          <div className={styles.row}>
            <Text className={styles.rangeLabel}>Zakres danych:</Text>
            <Select
              data={DATA_TYPE_OPTIONS}
              value={dataType}
              onChange={handleDataTypeChange}
              styles={{ input: { height: 25, minHeight: 25, whiteSpace: 'nowrap' } }}
              w={isMobile ? 128 : 170}
            />
            <div className={styles.floatingWrapper}>
              <span className={styles.floatingLabel}>od</span>
              <Select
                data={yearsOptionsFrom}
                placeholder="od"
                disabled={!sortedYears.length}
                classNames={{ option: styles.option, input: styles.option }}
                styles={{ input: { height: 25, minHeight: 25 } }}
                value={yearFrom ?? null}
                onChange={handleYearFromChange}
                w={82}
              />
            </div>
            <div className={styles.floatingWrapper}>
              <span className={styles.floatingLabel}>do</span>
              <Select
                data={yearsOptionsTo}
                placeholder="do"
                disabled={!sortedYears.length}
                classNames={{ option: styles.option, input: styles.option }}
                styles={{ input: { height: 25, minHeight: 25 } }}
                value={yearTo ?? null}
                onChange={handleYearToChange}
                w={82}
              />
            </div>
            <SegmentedControl
              value={isMonthlyData ? 'monthly' : 'yearly'}
              onChange={handleDataAggregationModeChange}
              data={[
                { label: isMobile ? 'Miesięczne' : 'Dane miesięczne', value: 'monthly' },
                { label: isMobile ? 'Roczne' : 'Dane roczne', value: 'yearly' },
              ]}
              size="xs"
            />
            {isMonthlyData && (
              <div className={styles.monthModeRow}>
                <SegmentedControl
                  className={styles.monthModeGroup}
                  value={monthlyMode}
                  onChange={handleMonthlyModeChange}
                  data={[
                    { label: 'Wszystkie miesiące', value: 'all' },
                    { label: 'Jeden miesiąc', value: 'single' },
                  ]}
                  size="xs"
                />
                {monthlyMode === 'single' && (
                  <Select
                    className={styles.monthSelect}
                    data={monthOptions}
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    placeholder="Miesiąc"
                    classNames={{ option: styles.option, input: styles.selectInput }}
                    styles={{ input: { height: 25, minHeight: 25 } }}
                  />
                )}
              </div>
            )}
            {isMonthlyData && monthlyMode === 'all' && (
              <SegmentedControl
                value={chartView}
                onChange={(value) => setChartView(value as 'line' | 'heatmap')}
                data={[
                  { label: 'Liniowy', value: 'line' },
                  { label: 'Kalendarz', value: 'heatmap' },
                ]}
                size="xs"
              />
            )}
          </div>
          <div className={styles.rowNoGap}>
            {isHeatmap ? (
              <Radio.Group
                label="Dane:"
                classNames={{ label: styles.rangeLabel }}
                value={selectedHeatmapAggregation}
                onChange={(value) => setAggregation([value as 'min' | 'avg' | 'max'])}
                className={styles.inlineGroup}
              >
                <Radio value="max" label={isMobile ? "Maks." : "Maksymalne"} color="red" />
                <Radio value="avg" label={isMobile ? "Śr." : "Średnie"} color="blue" />
                <Radio value="min" label={isMobile ? "Min." : "Minimalne"} color={isDark ? 'gray' : 'dark'} />
              </Radio.Group>
            ) : (
              <>
                <Checkbox.Group
                  label={"Dane:"}
                  classNames={{ label: styles.rangeLabel }}
                  value={aggregations}
                  onChange={(value) => setAggregation(value as ("min" | "avg" | "max")[])}
                  className={styles.inlineGroup}
                >
                  <Checkbox value="max" label={isMobile ? "Maks." : "Maksymalne"} color="red"/>
                  <Checkbox value="avg" label={isMobile ? "Śr." : "Średnie"} color="blue"/>
                  <Checkbox value="min" label={isMobile ? "Min." : "Minimalne"} color={isDark ? 'white' : 'black'} iconColor={isDark ? 'dark.8' : 'white'}/>
                </Checkbox.Group>
                <div className={styles.trendControls}>
                  <Checkbox
                    checked={trendLine !== 'none'}
                    onChange={(event) => handleTrendToggle(event.currentTarget.checked)}
                    label="Trend"
                  />
                  {trendLine !== 'none' && (
                    <>
                      <Select
                        className={styles.trendSelect}
                        data={trendOptions.filter((option) => option.value !== 'none')}
                        value={trendLine}
                        onChange={(value) => setTrendLine((value as 'min' | 'avg' | 'max' | null) ?? 'none')}
                        placeholder="Linia trendu"
                        classNames={{ option: styles.option, input: styles.selectInput }}
                        styles={{ input: { height: 25, minHeight: 25 } }}
                      />
                      {trendSummary && <Text className={styles.trendValue}>{trendSummary}</Text>}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
