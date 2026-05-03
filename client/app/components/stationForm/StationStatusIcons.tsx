'use client';

import { Group, ThemeIcon, Tooltip } from '@mantine/core';
import { IconTemperature } from '@tabler/icons-react';

export const HISTORICAL_TEMPERATURE_COLOR = '#1d4ed8';

type Props = {
  hasTemperatureData: boolean;
  hasFreshTemperatureData: boolean;
  hasFreshLevelData: boolean;
  freshYear?: number;
};

const iconStyle = (isActive: boolean) => ({
  opacity: isActive ? 1 : 0.35,
  transition: 'opacity 150ms ease',
});

export const FreshLevelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" strokeWidth="0" aria-hidden="true">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path stroke="#ffffff" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7q 4.5 -3 9 0t 9 0" />
    <path stroke="#ffffff" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 17q 4.5 -3 9 0q .218 .144 .434 .275" />
    <path stroke="#ffffff" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 12q 4.5 -3 9 0q 1.941 1.294 3.882 1.472" />
    <path stroke="#ffffff" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 22v-6" />
    <path stroke="#ffffff" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 19l-3 -3l-3 3" />
  </svg>
);

const StationStatusIcons = ({
  hasTemperatureData,
  hasFreshTemperatureData,
  hasFreshLevelData,
  freshYear = 2024,
}: Props) => {
  const temperatureTooltip = hasFreshTemperatureData
    ? `Temperatura wody dostępna dla ${freshYear}`
    : hasTemperatureData
      ? 'Stacja ma historyczne dane temperatury wody'
      : 'Stacja nie ma danych temperatury';

  return (
    <Group gap={6} wrap="nowrap">
      {hasTemperatureData ? (
        <Tooltip label={temperatureTooltip}>
          <ThemeIcon
            variant={hasFreshTemperatureData ? 'filled' : 'transparent'}
            color={hasFreshTemperatureData ? 'blue' : HISTORICAL_TEMPERATURE_COLOR}
            size="sm"
            radius="xl"
            style={iconStyle(hasFreshTemperatureData)}
          >
            <IconTemperature size={15} />
          </ThemeIcon>
        </Tooltip>
      ) : null}
      {hasFreshLevelData ? (
        <Tooltip label={`Poziom wody dostępny dla ${freshYear}`}>
          <ThemeIcon variant="filled" color="blue" size="sm" radius="xl" style={iconStyle(true)}>
            <FreshLevelIcon />
          </ThemeIcon>
        </Tooltip>
      ) : null}
    </Group>
  );
};

export default StationStatusIcons;
