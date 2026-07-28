import { LineChart } from '@mantine/charts';
import { Loader, Text, useMantineColorScheme } from '@mantine/core';
import { MonthlyStructuredRecordType, RecordDataType, StationType, YearlyRecordType } from "../../types/recordTypes";
import { useMonthlyRecords } from "../../hooks/useMonthlyRecords";
import { useCallback, useMemo } from 'react';
import { useStationStore } from '../../hooks/useStationStore';
import { useYearlyRecords } from '../../hooks/useYearlyRecords';
import ChartTooltip from '../chartTooltip/ChartTooltip';
import { WITHDRAWN_DATA_MESSAGE, WITHDRAWN_STATION_IDS } from '../../constants/withdrawnStations';

interface Props {
  selectedStation: StationType;
  selectedType: RecordDataType;
}

const Charts = ({ selectedStation, selectedType }: Props) => {
  const aggregation = useStationStore((state) => state.aggregation);
  const isMonthlyData = useStationStore((state) => state.isMonthlyData);
  const monthlyMode = useStationStore((state) => state.monthlyMode);
  const trendLine = useStationStore((state) => state.trendLine);
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const tickColor = isDark ? '#aaa' : '#444';
  const gridColor = isDark ? '#333' : '#e0e0e0';
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
      min: isDark ? 'white' : 'black',
      avg: 'blue',
      max: 'red',
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

  const maxTemperature = useMemo(() => {
    if (aggregation.includes('max')) {
      return 28;
    } else if (aggregation.includes('avg')) {
      return 18;
    } else {
      return 14;
    }
  }, [aggregation]);

  return (
    <div>
      {(isLoadingMonthly || isLoadingYearly) ? (
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader color="blue" size="xl" type="bars" />
        </div>
      ) : (isErrorMonthly || isErrorYearly) ? (
        <Text c="red">Błąd ładowania danych wykresu. Spróbuj ponownie.</Text>
      ) : (
      <>
      <div style={{ position: 'relative' }}>
        <LineChart
          h={350}
          data={dataWithTrend}
          dataKey="label"
          series={createSeries()}
          curveType="monotone"
          tickLine="x"
          gridAxis="xy"
          withDots={false}
          xAxisProps={{
            tick: {
              fill: tickColor,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: 'Poppins, sans-serif',
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
              fontFamily: 'Poppins, sans-serif',
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
            height: 50,
            wrapperStyle: {
              fontFamily: 'Poppins, sans-serif',
              fontSize: 18,
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
        {!hasData && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <Text size="lg" c="dimmed">Brak danych do wyświetlenia</Text>
          </div>
        )}
        {hasWithdrawnData && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 18px',
              background: isDark ? 'rgba(10, 10, 10, 0.45)' : 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'grayscale(1)',
              WebkitBackdropFilter: 'grayscale(1)',
              pointerEvents: 'none',
              borderRadius: 4,
            }}
          >
            <Text
              size="sm"
              fw={800}
              c={isDark ? '#f1c7c7' : '#8f1f1f'}
              style={{
                background: isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.92)',
                padding: '8px 12px',
                borderRadius: 999,
                border: `1px solid ${isDark ? 'rgba(241, 199, 199, 0.35)' : 'rgba(143, 31, 31, 0.2)'}`,
                textAlign: 'center',
                boxShadow: isDark ? '0 10px 24px rgba(0, 0, 0, 0.22)' : '0 10px 24px rgba(80, 80, 80, 0.12)',
              }}
            >
              {WITHDRAWN_DATA_MESSAGE}
            </Text>
          </div>
        )}
      </div>
      <div id="data-source-info" style={{ marginTop: 20 }}>
      <p style={{ fontSize: 14, textAlign: 'center', marginTop: 10, fontFamily: 'var(--font-open-sans), system-ui, sans-serif', color: tickColor }}>
        Źródłem pochodzenia danych jest <strong><a href="https://imgw.pl/" target="_blank">Instytut Meteorologii i Gospodarki Wodnej – Państwowy Instytut Badawczy</a></strong>
      </p>
      <p style={{ fontSize: 14, fontWeight: 800, color: '#d43e3e', textAlign: 'center', fontFamily: 'var(--font-open-sans), system-ui, sans-serif' }}>
        Dane Instytutu Meteorologii i Gospodarki Wodnej – Państwowego Instytutu Badawczego zostały przetworzone
      </p>
      </div>
      </>
      )}
    </div>
  );
}
export default Charts;
