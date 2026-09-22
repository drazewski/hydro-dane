import { Paper, Text } from '@mantine/core';
import { ReactNode } from 'react';
import { RecordDataTypeLabel } from '../../types/recordTypes';
import styles from './chartTooltip.module.css';

interface ChartTooltipProps {
  label: React.ReactNode;
  payload: Record<string, unknown>[] | undefined;
  unit?: string;
}

const ChartTooltip = ({ label, payload, unit }: ChartTooltipProps) => {
  if (!payload || payload.length === 0) return null;

  const formatValue = (item: Record<string, unknown>): ReactNode => {
    const value = item.value;
    if (typeof value !== 'number') {
      return value == null ? '' : String(value);
    }

    if (String(item.name).startsWith('trend')) {
      return value.toLocaleString('pl-PL', {
        minimumFractionDigits: Math.abs(value) < 1 ? 2 : 1,
        maximumFractionDigits: 2,
      });
    }

    return value.toLocaleString('pl-PL', { maximumFractionDigits: 2 });
  };

  return (
    <Paper
      role="tooltip"
      className={styles.tooltip}
      px="md"
      py="sm"
      withBorder
      shadow="md"
      radius="md"
      style={{ background: 'var(--hydro-surface)', color: 'var(--mantine-color-text)' }}
    >
      <Text fw={700} mb={6} className={styles.label}>
        {label}
      </Text>
      {payload.map((item: Record<string, unknown>) => {
        const displayName = RecordDataTypeLabel[item.name as keyof typeof RecordDataTypeLabel] ?? item.name;
        return (
          <Text key={item.name as string} c={item.color as string} fz="sm" ta="left" className={styles.value}>
            {displayName}: {formatValue(item)} {unit}
          </Text>
        );
      })}
    </Paper>
  );
}

export default ChartTooltip;
