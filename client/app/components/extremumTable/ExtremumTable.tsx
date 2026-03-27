'use client';
import { useMemo } from 'react';
import { Paper, ScrollArea, Table, Text, Stack } from '@mantine/core';
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

const formatMonthly = (row: MonthlyStructuredRecordType) =>
  `${String(row.month).padStart(2, '0')}-${row.year}`;

const formatYearly = (row: YearlyRecordType) => String(row.year);

const ExtremumTable = ({ selectedStation }: Props) => {
  const isMonthlyData = useStationStore((state) => state.isMonthlyData);
  const selectedYearFrom = useStationStore((s) => s.yearFrom);
  const selectedYearTo = useStationStore((s) => s.yearTo);
  const { data: monthlyData } = useMonthlyRecords(selectedStation.id, isMonthlyData);
  const { data: yearlyData } = useYearlyRecords(selectedStation.id, isMonthlyData);

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

  const headers = [
    'Stacja',
    'Stan wody maks.',
    'Stan wody min.',
    'Przepływ maks.',
    'Przepływ min.',
    'Temp. wody maks.',
    'Temp. wody min.',
  ];

  return (
    <Paper withBorder radius="md" p="md" mt="xl">
      <ScrollArea>
        <Table miw={600} highlightOnHover withRowBorders>
          <Table.Thead className={styles.thead}>
            <Table.Tr>
              {headers.map((h) => (
                <Table.Th key={h} className={h === 'Stacja' ? styles.firstCol : styles.valueCol}>
                  <Text fw={600} c="dimmed" size="sm">{h}</Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td className={styles.firstCol}>
                <Stack gap={2}>
                  <Text fw={500} size="sm">
                    {selectedStation.waterName} — {selectedStation.name.toUpperCase()}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {selectedYearFrom}–{selectedYearTo}
                  </Text>
                </Stack>
              </Table.Td>
              {[
                formatCell(extremums.maxLevel, 'cm'),
                formatCell(extremums.minLevel, 'cm'),
                formatCell(extremums.maxFlow, 'm³/s', 2),
                formatCell(extremums.minFlow, 'm³/s', 2),
                formatCell(extremums.maxTemperature, '°C'),
                formatCell(extremums.minTemperature, '°C'),
              ].map((val, i) => (
                <Table.Td key={i} className={styles.valueCol}>
                  <Text ta="right" size="sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {val}
                  </Text>
                </Table.Td>
              ))}
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default ExtremumTable;
