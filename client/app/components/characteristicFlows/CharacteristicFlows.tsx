'use client';

import { Table, Text, Tooltip } from '@mantine/core';
import { useMemo } from 'react';
import { useStationStore } from '../../hooks/useStationStore';
import { useYearlyRecords } from '../../hooks/useYearlyRecords';
import { RecordDataType, StationType, YearlyRecordType } from '../../types/recordTypes';
import styles from './characteristicFlows.module.css';

interface Props {
  selectedStation: StationType;
}

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

type CharacteristicConfig = {
  title: string;
  unit: string;
  decimals: number;
  fields: { min: keyof YearlyRecordType; avg: keyof YearlyRecordType; max: keyof YearlyRecordType };
  symbols: [string, string, string];
  tooltips: [string, string, string];
  descriptions: [string, string, string];
};

const characteristicConfigs: Partial<Record<RecordDataType, CharacteristicConfig>> = {
  [RecordDataType.flow]: {
    title: 'Przepływy charakterystyczne',
    unit: 'm³/s',
    decimals: 2,
    fields: { min: 'minFlow', avg: 'avgFlow', max: 'maxFlow' },
    symbols: ['SNQ', 'SSQ', 'SWQ'],
    tooltips: ['Średni niski przepływ', 'Średni średni przepływ', 'Średni wysoki przepływ'],
    descriptions: [
      'Średnia z rocznych przepływów minimalnych',
      'Średnia z rocznych przepływów średnich',
      'Średnia z rocznych przepływów maksymalnych',
    ],
  },
  [RecordDataType.level]: {
    title: 'Stany charakterystyczne',
    unit: 'cm',
    decimals: 0,
    fields: { min: 'minLevel', avg: 'avgLevel', max: 'maxLevel' },
    symbols: ['SNW', 'SSW', 'SWW'],
    tooltips: ['Średnia niska woda', 'Średnia średnia woda', 'Średnia wysoka woda'],
    descriptions: [
      'Średnia z rocznych stanów minimalnych',
      'Średnia z rocznych stanów średnich',
      'Średnia z rocznych stanów maksymalnych',
    ],
  },
};

const CharacteristicFlows = ({ selectedStation }: Props) => {
  const isMonthlyData = useStationStore((state) => state.isMonthlyData);
  const selectedType = useStationStore((state) => state.dataType);
  const { data: yearlyData, isLoading, isError } = useYearlyRecords(selectedStation.id, isMonthlyData);
  const config = characteristicConfigs[selectedType];

  const characteristics = useMemo(() => {
    if (!config) {
      return null;
    }

    const completeYears = yearlyData.filter(
      (record) =>
        record[config.fields.min] != null &&
        record[config.fields.avg] != null &&
        record[config.fields.max] != null
    );

    if (completeYears.length === 0) {
      return null;
    }

    const annualMinima = completeYears.map((record) => Number(record[config.fields.min]));
    const annualMeans = completeYears.map((record) => Number(record[config.fields.avg]));
    const annualMaxima = completeYears.map((record) => Number(record[config.fields.max]));

    return {
      from: completeYears[0].year,
      to: completeYears[completeYears.length - 1].year,
      count: completeYears.length,
      snq: average(annualMinima),
      ssq: average(annualMeans),
      swq: average(annualMaxima),
    };
  }, [config, yearlyData]);

  if (isMonthlyData || isLoading || isError || !config || !characteristics) {
    return null;
  }

  const rows = [
    [config.symbols[0], config.tooltips[0], config.descriptions[0], characteristics.snq],
    [config.symbols[1], config.tooltips[1], config.descriptions[1], characteristics.ssq],
    [config.symbols[2], config.tooltips[2], config.descriptions[2], characteristics.swq],
  ] as const;

  const formatValue = (value: number) =>
    `${value.toLocaleString('pl-PL', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    })} ${config.unit}`;

  return (
    <section className={styles.container}>
      <div className={styles.heading}>
        <Text fw={600}>{config.title}</Text>
        <Text size="sm" c="dimmed" mt={2}>
          Wielolecie {characteristics.from}–{characteristics.to}: {characteristics.count} pełnych lat hydrologicznych.
        </Text>
      </div>
      <Table mt="md" withRowBorders className={styles.table}>
        <Table.Tbody>
          {rows.map(([symbol, tooltip, description, value]) => (
            <Table.Tr key={symbol}>
              <Table.Td className={styles.symbol}>
                <Tooltip label={tooltip} withArrow position="top-start">
                  <abbr className={styles.abbreviation}>{symbol}</abbr>
                </Tooltip>
              </Table.Td>
              <Table.Td className={styles.description}>
                <Text size="sm" truncate="end" title={description}>{description}</Text>
              </Table.Td>
              <Table.Td className={styles.value}>{formatValue(value)}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </section>
  );
};

export default CharacteristicFlows;
