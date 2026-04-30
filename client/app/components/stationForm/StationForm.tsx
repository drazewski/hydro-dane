'use client';
import { useMemo, useState } from 'react';
import { ActionIcon, CloseButton, ComboboxItem, Group, Select, Text, Tooltip } from '@mantine/core';
import { IconPencil, IconX } from '@tabler/icons-react';
import { useStations } from '../../hooks/useStations';
import { useStationStore } from '../../hooks/useStationStore';
import StationStatusIcons from './StationStatusIcons';
import styles from './stationForm.module.css';

const normalizeStationSearch = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const StationForm = () => {
  const { stations, freshYear } = useStations();
  const selectedStation = useStationStore((state) => state.station);
  const setSelectedStation = useStationStore((state) => state.setSelectedStation);
  const [searchValue, setSearchValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const stationOptions = useMemo<ComboboxItem[]>(
    () =>
      stations.map((station) => ({
        value: station.id.toString(),
        label: station.fullName || '',
      })),
    [stations]
  );

  const stationLookup = useMemo(
    () => new Map(stations.map((station) => [station.id.toString(), station])),
    [stations]
  );

  const handleSelect = (newValue: string | null) => {
    if (!newValue) {
      return;
    }

    const newSelectedStation = stationLookup.get(newValue);

    if (newSelectedStation) {
      setSelectedStation(newSelectedStation);
      setSearchValue('');
      setIsEditing(false);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    setSelectedStation(null);
    setIsEditing(false);
  };

  if (selectedStation && !isEditing) {
    return (
      <div className={styles.actions}>
        <Tooltip label="Zmień stację" className={styles.editButton}>
          <ActionIcon
            variant="subtle"
            color="var(--mantine-primary-color-filled)"
            onClick={() => {
              setSearchValue('');
              setIsEditing(true);
            }}
            className={styles.editButton}
          >
            <IconPencil size={22} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Wyczyść wybór">
          <ActionIcon variant="subtle" color="red" onClick={handleClear}>
            <IconX size={22} />
          </ActionIcon>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={styles.searchRow}>
      <Select
        searchable
        value={null}
        data={stationOptions}
        placeholder="Wpisz nazwę rzeki, miejscowości lub numer stacji..."
        searchValue={searchValue}
        autoFocus={isEditing}
        nothingFoundMessage="Brak pasujących stacji"
        maxDropdownHeight={320}
        onSearchChange={setSearchValue}
        onChange={handleSelect}
        filter={({ options, search, limit }) => {
          const normalizedSearch = normalizeStationSearch(search);
          const matchedOptions: ComboboxItem[] = [];

          for (const option of options) {
            if ('group' in option) {
              continue;
            }

            const station = stationLookup.get(option.value);
            if (!station) {
              continue;
            }

            if (
              !normalizedSearch ||
              normalizeStationSearch(option.label).includes(normalizedSearch) ||
              normalizeStationSearch(station.name).includes(normalizedSearch) ||
              normalizeStationSearch(station.waterName).includes(normalizedSearch) ||
              station.id.toString().includes(normalizedSearch)
            ) {
              matchedOptions.push(option);
            }

            if (matchedOptions.length >= limit) {
              break;
            }
          }

          return matchedOptions;
        }}
        renderOption={({ option }) => {
          const station = stationLookup.get(option.value);

          if (!station) {
            return option.label;
          }

          return (
            <Group justify="space-between" gap="sm" wrap="nowrap">
              <div className={styles.optionText}>
                <Text size="sm" fw={500}>
                  {station.fullName}
                </Text>
                <Text size="xs" c="dimmed">
                  ID: {station.id}
                </Text>
              </div>
              <StationStatusIcons
                hasTemperatureData={station.hasTemperatureData}
                hasFreshTemperatureData={station.hasFreshTemperatureData}
                hasFreshLevelData={station.hasFreshLevelData}
                freshYear={freshYear}
              />
            </Group>
          );
        }}
        rightSection={
          searchValue ? <CloseButton onClick={() => setSearchValue('')} aria-label="Wyczyść wyszukiwanie" /> : null
        }
        rightSectionPointerEvents="all"
      />
    </div>
  );
};

export default StationForm;
