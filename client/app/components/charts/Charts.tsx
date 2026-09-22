import { LineChart } from '@mantine/charts';
import { ActionIcon, Loader, Text, Tooltip, useMantineColorScheme } from '@mantine/core';
import { MonthlyStructuredRecordType, RecordDataType, StationType, YearlyRecordType } from "../../types/recordTypes";
import { useMonthlyRecords } from "../../hooks/useMonthlyRecords";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStationStore } from '../../hooks/useStationStore';
import { useYearlyRecords } from '../../hooks/useYearlyRecords';
import ChartTooltip from '../chartTooltip/ChartTooltip';
import { WITHDRAWN_DATA_MESSAGE, WITHDRAWN_STATION_IDS } from '../../constants/withdrawnStations';
import MonthlyHeatmap from '../monthlyHeatmap/MonthlyHeatmap';
import styles from './charts.module.css';
import { IconArrowsHorizontal, IconMaximize, IconMinimize } from '@tabler/icons-react';

interface Props {
  selectedStation: StationType;
  selectedType: RecordDataType;
}

const Charts = ({ selectedStation, selectedType }: Props) => {
  const chartCardRef = useRef<HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const [heatmapFitWidth, setHeatmapFitWidth] = useState(false);
  const aggregation = useStationStore((state) => state.aggregation);
  const isMonthlyData = useStationStore((state) => state.isMonthlyData);
  const monthlyMode = useStationStore((state) => state.monthlyMode);
  const selectedMonth = useStationStore((state) => state.selectedMonth);
  const chartView = useStationStore((state) => state.chartView);
  const trendLine = useStationStore((state) => state.trendLine);
  const yearFrom = useStationStore((state) => state.yearFrom);
  const yearTo = useStationStore((state) => state.yearTo);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const tickColor = isDark ? '#c4d0da' : '#444';
  const gridColor = isDark ? '#3a4a57' : '#e0e0e0';
  const hasWithdrawnData = WITHDRAWN_STATION_IDS.has(selectedStation.id);
  const { data: monthlyData, isLoading: isLoadingMonthly, isError: isErrorMonthly } = useMonthlyRecords(selectedStation?.id, isMonthlyData);
  const { data: yearlyData, isLoading: isLoadingYearly, isError: isErrorYearly } = useYearlyRecords(selectedStation?.id, isMonthlyData);

  const data = useMemo(() => {
    if (isMonthlyData) {
      return (monthlyData ?? []).map((d: MonthlyStructuredRecordType) => ({
        ...d,
        label: monthlyMode === 'single' ? String(d.year) : `${String(d.month).padStart(2, '0')}.${d.year}`,
      }));
    }

    return (yearlyData ?? []).map((d: YearlyRecordType) => ({
      ...d,
      label: String(d.year),
    }));
  }, [yearlyData, monthlyData, isMonthlyData, monthlyMode]);

  const capitalizedType = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
  const minLineData = `min${capitalizedType}`;
  const avgLineData = `avg${capitalizedType}`;
  const maxLineData = `max${capitalizedType}`;
  const lineColors = useMemo(
    () => ({
      min: isDark ? '#b8c5d0' : '#536575',
      avg: isDark ? '#63b3ed' : '#217fc2',
      max: isDark ? '#ff9b7a' : '#d95d39',
    }),
    [isDark]
  );

  const getUnit = useCallback(() => {
    switch (selectedType) {
      case RecordDataType.flow:
        return 'm3/s';
      case RecordDataType.level:
        return 'cm';
      case RecordDataType.temperature:
        return '°C';
      default:
        return '';
    }
  }, [selectedType]);

  const trendMeta = useMemo(() => {
    if (trendLine === 'none') {
      return null;
    }

    const lineKeyMap = {
      min: minLineData,
      avg: avgLineData,
      max: maxLineData,
    } as const;

    const selectedKey = lineKeyMap[trendLine];
    const useYearAsX = !isMonthlyData || monthlyMode === 'single';
    const points = data
      .map((item, index) => {
        const rawValue = item[selectedKey as keyof typeof item];
        const value = typeof rawValue === 'number' ? rawValue : null;
        const pointX = useYearAsX && typeof item.year === 'number' ? item.year : index;
        return value == null ? null : { x: pointX, y: value };
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
    const intercept = (sumY - slope * sumX) / count;
    const trendKey = `trend${selectedKey.charAt(0).toUpperCase()}${selectedKey.slice(1)}`;
    const unitSuffix = useYearAsX ? '/rok' : '/miesiąc';
    const trendLabel = `${slope >= 0 ? '+' : ''}${slope.toFixed(Math.abs(slope) < 1 ? 2 : 1)} ${getUnit()} ${unitSuffix}`;

    return {
      key: trendKey,
      slope,
      intercept,
      label: trendLabel,
      canDisplayLabel: useYearAsX,
      useYearAsX,
    };
  }, [avgLineData, data, getUnit, isMonthlyData, maxLineData, minLineData, monthlyMode, trendLine]);

  const dataWithTrend = useMemo(() => {
    if (!trendMeta) {
      return data;
    }

    return data.map((item, index) => ({
      ...item,
      [trendMeta.key]:
        trendMeta.slope * (trendMeta.useYearAsX && typeof item.year === 'number' ? item.year : index) +
        trendMeta.intercept,
    }));
  }, [data, trendMeta]);

  const hasData = useMemo(() => {
    return data.some(
      (d: Record<string, unknown>) => d[minLineData] != null || d[avgLineData] != null || d[maxLineData] != null
    );
  }, [data, minLineData, avgLineData, maxLineData]);

  const createSeries = useCallback(() => {
    const series = [];
    if (aggregation.includes('min')) {
      series.push({ name: minLineData, label: 'minimalne wartości', color: lineColors.min, strokeWidth: 1 });
    }
    if (aggregation.includes('avg')) {
      series.push({ name: avgLineData, label: 'średnie wartości', color: lineColors.avg, strokeWidth: 3 });
    }
    if (aggregation.includes('max')) {
      series.push({ name: maxLineData, label: 'maksymalne wartości', color: lineColors.max, strokeWidth: 1 });
    }

    if (trendLine !== 'none' && aggregation.includes(trendLine) && trendMeta) {
      const trendKeyMap = {
        min: `trend${minLineData.charAt(0).toUpperCase()}${minLineData.slice(1)}`,
        avg: `trend${avgLineData.charAt(0).toUpperCase()}${avgLineData.slice(1)}`,
        max: `trend${maxLineData.charAt(0).toUpperCase()}${maxLineData.slice(1)}`,
      } as const;
      const trendLabelMap = {
        min: 'trend minimalnych wartości',
        avg: 'trend średnich wartości',
        max: 'trend maksymalnych wartości',
      } as const;

      series.push({
        name: trendKeyMap[trendLine],
        label: trendLabelMap[trendLine],
        color: lineColors[trendLine],
        strokeWidth: 2,
        strokeDasharray: '6 4',
      });
    }
    return series;
  }, [aggregation, avgLineData, lineColors, maxLineData, minLineData, trendLine, trendMeta]);

  useEffect(() => {
    setHiddenSeries([]);
  }, [aggregation, isMonthlyData, maxLineData, minLineData, monthlyMode, selectedType, trendLine]);

  const chartSeries = useMemo(
    () => createSeries().filter((series) => !hiddenSeries.includes(series.name)),
    [createSeries, hiddenSeries]
  );

  const toggleSeries = (seriesName: string) => {
    setHiddenSeries((current) =>
      current.includes(seriesName)
        ? current.filter((name) => name !== seriesName)
        : [...current, seriesName]
    );
  };

  const maxTemperature = useMemo(() => {
    if (aggregation.includes('max')) {
      return 28;
    } else if (aggregation.includes('avg')) {
      return 18;
    } else {
      return 14;
    }
  }, [aggregation]);

  const dataTypeLabel = {
    [RecordDataType.level]: 'Stan wody',
    [RecordDataType.flow]: 'Przepływ',
    [RecordDataType.temperature]: 'Temperatura wody',
  }[selectedType];
  const monthNames = [
    'styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień',
  ];
  const selectedMonthLabel = selectedMonth ? monthNames[Number(selectedMonth) - 1] : null;
  const unit = getUnit();
  const periodLabel = yearFrom && yearTo ? `${yearFrom}–${yearTo}` : 'wybrany zakres';
  const viewLabel = isMonthlyData
    ? monthlyMode === 'single'
      ? `miesięczne · wybrany miesiąc${selectedMonthLabel ? ` (${selectedMonthLabel})` : ''}`
      : 'miesięczne · wszystkie miesiące'
    : 'roczne';

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === chartCardRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!chartCardRef.current) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await chartCardRef.current.requestFullscreen();
  }, []);

  const summary = useMemo(() => {
    const valuesFor = (key: string) =>
      data
        .map((item) => {
          const value = item[key as keyof typeof item];
          return typeof value === 'number' ? value : null;
        })
        .filter((value): value is number => value !== null);
    const average = (values: number[]) =>
      values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length;
    const metricRows = data.filter((item) =>
      [minLineData, avgLineData, maxLineData].some((key) => {
        const value = item[key as keyof typeof item];
        return typeof value === 'number';
      })
    ).length;
    const selectedFrom = yearFrom ? Number(yearFrom) : null;
    const selectedTo = yearTo ? Number(yearTo) : null;
    const yearCount = selectedFrom != null && selectedTo != null
      ? Math.max(0, selectedTo - selectedFrom + 1)
      : new Set(data.map((item) => item.year)).size;
    const expectedRows = isMonthlyData
      ? yearCount * (monthlyMode === 'single' ? 1 : 12)
      : yearCount;
    const completeness = expectedRows > 0 ? Math.round((metricRows / expectedRows) * 100) : null;

    return {
      min: Math.min(...valuesFor(minLineData)),
      avg: average(valuesFor(avgLineData)),
      max: Math.max(...valuesFor(maxLineData)),
      completeness,
      metricRows,
      expectedRows,
    };
  }, [avgLineData, data, isMonthlyData, maxLineData, minLineData, monthlyMode, yearFrom, yearTo]);

  const formatSummaryValue = useCallback((value: number | null) => {
    if (value == null || !Number.isFinite(value)) return '—';
    return `${value.toLocaleString('pl-PL', {
      maximumFractionDigits: selectedType === RecordDataType.flow ? 2 : 1,
    })} ${unit}`;
  }, [selectedType, unit]);

  return (
    <section ref={chartCardRef} className={styles.card} aria-label={`Wykres: ${dataTypeLabel}`}>
      <header className={styles.header}>
        <div>
          <Text className={styles.stationContext}>
            {selectedStation.waterName} — {selectedStation.name.toUpperCase()} ({selectedStation.id})
          </Text>
          <Text className={styles.title}>{dataTypeLabel}</Text>
          <Text className={styles.subtitle}>
            {viewLabel} · {periodLabel} · jednostka: {unit}
          </Text>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.status} aria-live="polite">
            <span className={styles.statusDot} />
            Dane IMGW-PIB
          </div>
          <div className={styles.chartActions}>
            {isMonthlyData && chartView === 'heatmap' && (
              <Tooltip label={heatmapFitWidth ? 'Przywróć szerokie komórki' : 'Dopasuj kalendarz do szerokości'}>
                <ActionIcon
                  variant={heatmapFitWidth ? 'light' : 'subtle'}
                  color="gray"
                  onClick={() => setHeatmapFitWidth((fit) => !fit)}
                  aria-label={heatmapFitWidth ? 'Przywróć szerokie komórki' : 'Dopasuj kalendarz do szerokości'}
                >
                  <IconArrowsHorizontal size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label={isFullscreen ? 'Zamknij pełny ekran' : 'Otwórz pełny ekran'}>
              <ActionIcon variant="subtle" color="gray" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Zamknij pełny ekran' : 'Otwórz pełny ekran'}>
                {isFullscreen ? <IconMinimize size={18} /> : <IconMaximize size={18} />}
              </ActionIcon>
            </Tooltip>
          </div>
        </div>
      </header>
      <div className={styles.plotArea}>
      {(isLoadingMonthly || isLoadingYearly) ? (
        <div className={styles.loading}>
          <Loader color="blue" size="xl" type="bars" />
        </div>
      ) : (isErrorMonthly || isErrorYearly) ? (
        <Text c="red" className={styles.message}>Błąd ładowania danych wykresu. Spróbuj ponownie.</Text>
      ) : chartView === 'heatmap' && isMonthlyData ? (
        <MonthlyHeatmap
          data={monthlyData ?? []}
          selectedType={selectedType}
          aggregation={aggregation}
          fitToWidth={heatmapFitWidth}
        />
      ) : (
      <>
      <div className={styles.chartFrame}>
        <div className={styles.legendControls} aria-label="Serie na wykresie">
          {createSeries().map((series) => {
            const isHidden = hiddenSeries.includes(series.name);
            return (
              <button
                type="button"
                key={series.name}
                className={`${styles.legendButton} ${isHidden ? styles.legendButtonHidden : ''}`}
                aria-pressed={!isHidden}
                onClick={() => toggleSeries(series.name)}
              >
                <span className={styles.legendSwatch} style={{ backgroundColor: series.color }} />
                <span className={styles.legendLabelDesktop}>{series.label}</span>
                <span className={styles.legendLabelMobile}>
                  {series.name.startsWith('min') ? 'Min.' : series.name.startsWith('avg') ? 'Śr.' : series.name.startsWith('max') ? 'Maks.' : 'Trend'}
                </span>
              </button>
            );
          })}
        </div>
        <LineChart
          h={{ base: 360, sm: 460 }}
          data={dataWithTrend}
          dataKey="label"
          series={chartSeries}
          curveType="monotone"
          withLegend={false}
          tickLine="x"
          gridAxis="xy"
          withDots={false}
          xAxisProps={{
            tick: {
              fill: tickColor,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'var(--font-montserrat, Arial), system-ui, sans-serif',
            },
            axisLine: { stroke: gridColor },
          }}
          yAxisProps={{
            domain: selectedType === RecordDataType.temperature
              ? [0, maxTemperature]
              : [
                  (dataMin: number) => isFinite(dataMin) ? Math.floor(dataMin - (dataMin * 0.3)) : 0,
                  (dataMax: number) => isFinite(dataMax) ? Math.ceil(dataMax + (dataMax * 0.3)) : 100,
                ],
            tick: {
              fill: tickColor,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'var(--font-montserrat, Arial), system-ui, sans-serif',
            },
            tickFormatter: (v) => `${v} ${getUnit()}`,
            axisLine: { stroke: gridColor },
          }}
          gridProps={{
            stroke: gridColor,
            strokeDasharray: '3 3',
          }}
          legendProps={{
            verticalAlign: 'bottom',
            height: 42,
            wrapperStyle: {
              fontFamily: 'var(--font-montserrat, Arial), system-ui, sans-serif',
              fontSize: 13,
              color: tickColor,
            },
          }}
          valueFormatter={(value) => `${value} ${getUnit()}`}
          tooltipProps={
            hasWithdrawnData
              ? { content: () => null }
              : {
                  content: ({ label, payload }) => (
                    <ChartTooltip
                      label={label}
                      payload={payload as Record<string, unknown>[] | undefined}
                      unit={getUnit()}
                    />
                  ),
                  position: { y: 90 },
                }
          }
        />
        {(!hasData || chartSeries.length === 0) && (
          <div className={styles.emptyState}>
            <Text size="lg" c="dimmed">
              {chartSeries.length === 0 && hasData ? 'Wybierz serię w legendzie' : 'Brak danych do wyświetlenia'}
            </Text>
          </div>
        )}
        {hasWithdrawnData && (
          <div className={styles.withdrawnOverlay}>
            <Text
              size="sm"
              fw={800}
              c={isDark ? '#f1c7c7' : '#8f1f1f'}
              className={styles.withdrawnMessage}
            >
              {WITHDRAWN_DATA_MESSAGE}
            </Text>
          </div>
        )}
      </div>
      <div className={styles.summary} aria-label="Podsumowanie widocznych danych">
        <div className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>Minimum</Text>
          <Text className={styles.summaryValue}>{formatSummaryValue(summary.min)}</Text>
          <Text className={styles.summaryMeta}>widoczny zakres</Text>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryCardPrimary}`}>
          <Text className={styles.summaryLabel}>Średnia</Text>
          <Text className={styles.summaryValue}>{formatSummaryValue(summary.avg)}</Text>
          <Text className={styles.summaryMeta}>widoczny zakres</Text>
        </div>
        <div className={styles.summaryCard}>
          <Text className={styles.summaryLabel}>Maksimum</Text>
          <Text className={styles.summaryValue}>{formatSummaryValue(summary.max)}</Text>
          <Text className={styles.summaryMeta}>widoczny zakres</Text>
        </div>
        <div className={`${styles.summaryCard} ${styles.summaryCardTrend}`}>
          <Text className={styles.summaryLabel}>Trend</Text>
          <Text className={styles.summaryValue}>{trendMeta?.label ?? '—'}</Text>
          <Text className={styles.summaryMeta}>
            {trendMeta
              ? `${summary.completeness ?? 0}% kompletności danych`
              : 'włącz w opcjach wykresu'}
          </Text>
        </div>
      </div>
      <div id="data-source-info" style={{ marginTop: 14 }}>
      <p className={styles.source}>
        Źródłem pochodzenia danych jest <a href="https://imgw.pl/" target="_blank" rel="noreferrer">Instytut Meteorologii i Gospodarki Wodnej – Państwowy Instytut Badawczy</a>{' '}
        Dane Instytutu Meteorologii i Gospodarki Wodnej – Państwowego Instytutu Badawczego zostały przetworzone
      </p>
      </div>
      </>
      )}
      </div>
    </section>
  );
}
export default Charts;
