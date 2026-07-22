import { Paper, Text } from '@mantine/core';
import { ReactNode } from 'react';
import { RecordDataTypeLabel } from '../../types/recordTypes';

interface ChartTooltipProps {
  label: React.ReactNode;
  payload: Record<string, unknown>[] | undefined;
  unit?: string;
}

const ChartTooltip = ({ label, payload, unit }: ChartTooltipProps) => {
  if (!payload) return null;

  const formatValue = (item: Record<string, unknown>): ReactNode => {
    const value = item.value;
    if (typeof value !== 'number') {
      return value == null ? '' : String(value);
    }

    if (String(item.name).startsWith('trend')) {
      return value.toFixed(Math.abs(value) < 1 ? 2 : 1);
    }

    return value;
  };

  return (
    <Paper px="md" py="sm" bg="white" withBorder shadow="md" radius="md">
      <Text fw={500} mb={5}>
        {label}
      </Text>
      {payload.map((item: Record<string, unknown>) => {
        const displayName = RecordDataTypeLabel[item.name as keyof typeof RecordDataTypeLabel] ?? item.name;
        return (
          <Text key={item.name as string} c={item.color as string} fz="sm" ta={"left"}>
            {displayName}: {formatValue(item)} {unit}
          </Text>
        );
      })}
    </Paper>
  );
}

export default ChartTooltip;
