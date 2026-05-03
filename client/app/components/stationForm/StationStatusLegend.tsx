'use client';

import { Group, Text, ThemeIcon } from '@mantine/core';
import { IconTemperature } from '@tabler/icons-react';
import { FreshLevelIcon, HISTORICAL_TEMPERATURE_COLOR } from './StationStatusIcons';
import styles from './stationForm.module.css';

type Props = {
  freshYear: number;
};

const StationStatusLegend = ({ freshYear }: Props) => (
  <div className={styles.legend}>
    <Text size="xs" c="dimmed" fw={600} className={styles.legendTitle}>
      Objaśnienie ikonek stanu stacji
    </Text>
    <div className={styles.legendItems}>
      <Group gap={8} wrap="nowrap">
        <ThemeIcon variant="transparent" color={HISTORICAL_TEMPERATURE_COLOR} size="sm" radius="xl">
          <IconTemperature size={15} />
        </ThemeIcon>
        <Text size="xs" c="dimmed">
          Dostępne są historyczne dane temperatury wody
        </Text>
      </Group>
      <Group gap={8} wrap="nowrap">
        <ThemeIcon variant="filled" color="blue" size="sm" radius="xl">
          <IconTemperature size={15} />
        </ThemeIcon>
        <Text size="xs" c="dimmed">
          Dostępne są dane temperatury wody z ostatniego roku pomiarowego w aplikacji: {freshYear}
        </Text>
      </Group>
      <Group gap={8} wrap="nowrap">
        <ThemeIcon variant="filled" color="blue" size="sm" radius="xl">
          <FreshLevelIcon />
        </ThemeIcon>
        <Text size="xs" c="dimmed">
          Dostępne są dane poziomu wody z ostatniego roku pomiarowego w aplikacji: {freshYear}
        </Text>
      </Group>
    </div>
  </div>
);

export default StationStatusLegend;
