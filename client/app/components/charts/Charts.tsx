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
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const tickColor = isDark ? '#aaa' : '#444';
  const gridColor = isDark ? '#333' : '#e0e0e0';
  const hasWithdrawnData = WITHDRAWN_STATION_IDS.has(selectedStation.id);
  const { data: monthlyData, isLoading: isLoadingMonthly, isError: isErrorMonthly } = useMonthlyRecords(selectedStation?.id, isMonthlyData);
  const { data: yearlyData, isLoading: isLoadingYearly, isError: isErrorYearly } = useYearlyRecords(selectedStation?.id, isMonthlyData);

  const data = useMemo(() => {
    if (!monthlyData || !yearlyData) return [];

    if (isMonthlyData) {
      return monthlyData.map((d: MonthlyStructuredRecordType) => ({
        ...d,
        label: `${String(d.month).padStart(2, '0')}.${d.year}`,
      }));
    } else {
      return yearlyData.map((d: YearlyRecordType) => ({
        ...d,
        label: String(d.year),
      }));
    }
  }, [yearlyData, monthlyData, isMonthlyData]);

  const capitalizedType = selectedType.charAt(0).toUpperCase() + selectedType.slice(1);
  const minLineData = `min${capitalizedType}`;
  const avgLineData = `avg${capitalizedType}`;
  const maxLineData = `max${capitalizedType}`;

  const hasData = useMemo(() => {
    return data.some(
      (d: Record<string, unknown>) => d[minLineData] != null || d[avgLineData] != null || d[maxLineData] != null
    );
  }, [data, minLineData, avgLineData, maxLineData]);

  const createSeries = useCallback(() => {
    const series = [];
    if (aggregation.includes('min')) {
      series.push({ name: minLineData, label: 'minimalne wartości', color: isDark ? 'white' : 'black', strokeWidth: 1 });
    }
    if (aggregation.includes('avg')) {
      series.push({ name: avgLineData, label: 'średnie wartości', color: 'blue', strokeWidth: 3 });
    }
    if (aggregation.includes('max')) {
      series.push({ name: maxLineData, label: 'maksymalne wartości', color: 'red', strokeWidth: 1 });
    }
    return series;
  }, [aggregation, minLineData, avgLineData, maxLineData, isDark]);

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
          data={data}
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
