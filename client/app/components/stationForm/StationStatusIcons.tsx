'use client';

import { Group, ThemeIcon, Tooltip } from '@mantine/core';
import { IconDroplet, IconTemperature } from '@tabler/icons-react';

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

const StationStatusIcons = ({
  hasTemperatureData,
  hasFreshTemperatureData,
  hasFreshLevelData,
  freshYear = 2024,
}: Props) => {
  const temperatureTooltip = hasFreshTemperatureData
    ? `Stacja ma aktualne dane temperatury z ${freshYear}`
    : hasTemperatureData
      ? 'Stacja ma historyczne dane temperatury'
      : 'Stacja nie ma danych temperatury';

  return (
    <Group gap={6} wrap="nowrap">
      {hasTemperatureData ? (
        <Tooltip label={temperatureTooltip}>
          <ThemeIcon
            variant={hasFreshTemperatureData ? 'filled' : 'light'}
            color="blue"
            size="sm"
            radius="xl"
            style={iconStyle(hasFreshTemperatureData)}
          >
            <IconTemperature size={14} />
          </ThemeIcon>
        </Tooltip>
      ) : null}
      <Tooltip
        label={
          hasFreshLevelData
            ? `Stacja ma aktualne dane stanu wody z ${freshYear}`
            : `Stacja nie ma aktualnych danych stanu wody z ${freshYear}`
        }
      >
        <ThemeIcon
          variant={hasFreshLevelData ? 'filled' : 'transparent'}
          color={hasFreshLevelData ? 'blue' : 'gray'}
          size="sm"
          radius="xl"
          style={iconStyle(hasFreshLevelData)}
        >
          <IconDroplet size={14} />
        </ThemeIcon>
      </Tooltip>
    </Group>
  );
};

export default StationStatusIcons;
