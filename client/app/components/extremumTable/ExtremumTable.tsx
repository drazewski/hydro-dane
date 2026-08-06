'use client';
import { useMemo } from 'react';
import { Table, Text } from '@mantine/core';
import { useStationStore } from '../../hooks/useStationStore';
import { useMonthlyRecords } from '../../hooks/useMonthlyRecords';
import { useYearlyRecords } from '../../hooks/useYearlyRecords';
import { MonthlyStructuredRecordType, StationType, YearlyRecordType } from '../../types/recordTypes';
import styles from './extremumTable.module.css';

interface Props {
  selectedStation: StationType;
}

type Extremum = { value: number | null; date: string };

function findExtremum<T extends Record<string, unknown>>(
  data: T[],
  field: string,
  mode: 'min' | 'max',
  formatDate: (row: T) => string
): Extremum {
  let best: number | null = null;
  let date = '';
  for (const row of data) {
    const v = row[field] as number | null | undefined;
    if (v == null) continue;
    if (best === null || (mode === 'max' ? v > best : v < best)) {
      best = v;
      date = formatDate(row);
    }
  }
  return { value: best, date };
}

const formatMonthly = (row: Pick<MonthlyStructuredRecordType, 'year' | 'month'>) =>
  `${String(row.month).padStart(2, '0')}-${row.year}`;

const formatYearly = (row: YearlyRecordType) => String(row.year);

const ExtremumTable = ({ selectedStation }: Props) => {
  const isMonthlyData = useStationStore((state) => state.isMonthlyData);
  const { fullData: monthlyData } = useMonthlyRecords(selectedStation.id, isMonthlyData);
  const { fullData: yearlyData } = useYearlyRecords(selectedStation.id, isMonthlyData);

  const observationRange = useMemo(() => {
    const years = (isMonthlyData ? monthlyData : yearlyData).map((row) => row.year);
    if (years.length === 0) {
      return '—';
    }

    return `${Math.min(...years)}–${Math.max(...years)}`;
  }, [isMonthlyData, monthlyData, yearlyData]);

  const extremums = useMemo(() => {
    if (isMonthlyData) {
      const d = (monthlyData as MonthlyStructuredRecordType[]).map(row => ({
        ...row,
        minLevel: row.minLevel != null && row.minLevel > 0 ? row.minLevel : undefined,
        maxLevel: row.maxLevel != null && row.maxLevel > 0 ? row.maxLevel : undefined,
        minFlow: row.minFlow != null && row.minFlow > 0 ? row.minFlow : undefined,
        maxFlow: row.maxFlow != null && row.maxFlow > 0 ? row.maxFlow : undefined,
      }));
      return {
        maxLevel: findExtremum(d, 'maxLevel', 'max', formatMonthly),
        minLevel: findExtremum(d, 'minLevel', 'min', formatMonthly),
        maxFlow: findExtremum(d, 'maxFlow', 'max', formatMonthly),
        minFlow: findExtremum(d, 'minFlow', 'min', formatMonthly),
        maxTemperature: findExtremum(d, 'maxTemperature', 'max', formatMonthly),
        minTemperature: findExtremum(d, 'minTemperature', 'min', formatMonthly),
      };
    } else {
      const d = (yearlyData as YearlyRecordType[]).map(row => ({
        ...row,
        minLevel: row.minLevel != null && Number(row.minLevel) > 0 ? row.minLevel : null,
        maxLevel: row.maxLevel != null && Number(row.maxLevel) > 0 ? row.maxLevel : null,
        minFlow: row.minFlow != null && Number(row.minFlow) > 0 ? row.minFlow : null,
        maxFlow: row.maxFlow != null && Number(row.maxFlow) > 0 ? row.maxFlow : null,
      }));
      return {
        maxLevel: findExtremum(d, 'maxLevel', 'max', formatYearly),
        minLevel: findExtremum(d, 'minLevel', 'min', formatYearly),
        maxFlow: findExtremum(d, 'maxFlow', 'max', formatYearly),
        minFlow: findExtremum(d, 'minFlow', 'min', formatYearly),
        maxTemperature: findExtremum(d, 'maxTemperature', 'max', formatYearly),
        minTemperature: findExtremum(d, 'minTemperature', 'min', formatYearly),
      };
    }
  }, [isMonthlyData, monthlyData, yearlyData]);

  const formatCell = (ext: Extremum, unit: string, decimals = 0) => {
    if (ext.value == null) return '—';
    const formatted = decimals > 0 ? ext.value.toFixed(decimals) : String(ext.value);
    return `${formatted} ${unit} (${ext.date})`;
  };

  const temperatureRows = [
    ['Najwyższa temperatura wody', formatCell(extremums.maxTemperature, '°C')],
    ['Najniższa temperatura wody', formatCell(extremums.minTemperature, '°C')],
  ] as const;

  const hasTemperatureData =
    extremums.maxTemperature.value != null || extremums.minTemperature.value != null;

  const rows = [
    ['Najwyższy stan wody', formatCell(extremums.maxLevel, 'cm')],
    ['Najniższy stan wody', formatCell(extremums.minLevel, 'cm')],
    ['Najwyższy przepływ', formatCell(extremums.maxFlow, 'm³/s', 2)],
    ['Najniższy przepływ', formatCell(extremums.minFlow, 'm³/s', 2)],
    ...(hasTemperatureData ? temperatureRows : []),
  ] as const;

  return (
    <section>
      <div className={styles.heading}>
        <Text fw={600}>Ekstrema obserwacji</Text>
        <Text size="sm" c="dimmed" mt={2}>
          Cały dostępny okres: {observationRange}
        </Text>
      </div>
      <Table mt="md" withRowBorders className={styles.table}>
        <Table.Tbody>
          {rows.map(([label, value]) => (
            <Table.Tr key={label}>
              <Table.Td className={styles.label}>
                <Text size="sm" c="dimmed" truncate="end" title={label}>{label}</Text>
              </Table.Td>
              <Table.Td className={styles.value}>
                <Text ta="right" size="sm" style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {value}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </section>
  );
};

export default ExtremumTable;
