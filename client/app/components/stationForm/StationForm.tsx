'use client';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ActionIcon, CloseButton, ComboboxItem, Group, Select, Text, Tooltip } from '@mantine/core';
import { IconPencil, IconX } from '@tabler/icons-react';
import { useStations } from '../../hooks/useStations';
import { useStationStore } from '../../hooks/useStationStore';
import StationStatusLegend from './StationStatusLegend';
import StationStatusIcons from './StationStatusIcons';
import { trackStationSelected } from '../analytics/analyticsEvents';
import styles from './stationForm.module.css';

const INITIAL_VISIBLE_OPTIONS = 120;
const OPTIONS_PAGE_SIZE = 120;
const LOAD_MORE_THRESHOLD_PX = 160;
const LOADING_OPTION_VALUE = '__loading_more_stations__';

type StationOption = ComboboxItem & {
  searchText: string;
};

const normalizeStationSearch = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const StationForm = () => {
  const { stations, freshYear } = useStations();
  const selectedStation = useStationStore((state) => state.station);
  const dataType = useStationStore((state) => state.dataType);
  const setSelectedStation = useStationStore((state) => state.setSelectedStation);
  const [searchValue, setSearchValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [visibleOptionsLimit, setVisibleOptionsLimit] = useState(INITIAL_VISIBLE_OPTIONS);
  const deferredSearchValue = useDeferredValue(searchValue);
  const normalizedDeferredSearchValue = normalizeStationSearch(deferredSearchValue);

  useEffect(() => {
    setVisibleOptionsLimit(INITIAL_VISIBLE_OPTIONS);
  }, [normalizedDeferredSearchValue]);

  const stationOptions = useMemo<StationOption[]>(
    () =>
      stations.map((station) => ({
        value: station.id.toString(),
        label: station.fullName || '',
        searchText: normalizeStationSearch(
          `${station.id} ${station.fullName || ''} ${station.name} ${station.waterName}`
        ),
      })),
    [stations]
  );

  const stationLookup = useMemo(
    () => new Map(stations.map((station) => [station.id.toString(), station])),
    [stations]
  );

  const filteredOptions = useMemo(() => {
    if (!normalizedDeferredSearchValue) {
      return stationOptions;
    }

    return stationOptions.filter((option) => option.searchText.includes(normalizedDeferredSearchValue));
  }, [normalizedDeferredSearchValue, stationOptions]);

  const hasMoreOptions = filteredOptions.length > visibleOptionsLimit;

  const visibleOptions = useMemo<ComboboxItem[]>(() => {
    const slicedOptions = filteredOptions.slice(0, visibleOptionsLimit);

    if (!hasMoreOptions) {
      return slicedOptions;
    }

    return [
      ...slicedOptions,
      {
        value: LOADING_OPTION_VALUE,
        label: 'Wczytywanie kolejnych stacji...',
        disabled: true,
      },
    ];
  }, [filteredOptions, hasMoreOptions, visibleOptionsLimit]);

  const loadMoreOptions = () => {
    if (!hasMoreOptions) {
      return;
    }

    setVisibleOptionsLimit((currentLimit) =>
      Math.min(currentLimit + OPTIONS_PAGE_SIZE, filteredOptions.length)
    );
  };

  const handleSelect = (newValue: string | null) => {
    if (!newValue || newValue === LOADING_OPTION_VALUE) {
      return;
    }

    const newSelectedStation = stationLookup.get(newValue);

    if (newSelectedStation) {
      setSelectedStation(newSelectedStation);
      trackStationSelected(newSelectedStation, dataType);
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
        data={visibleOptions}
        placeholder="Wpisz nazwę rzeki, miejscowości lub numer stacji..."
        searchValue={searchValue}
        autoFocus={isEditing}
        nothingFoundMessage="Brak pasujących stacji"
        maxDropdownHeight={320}
        onSearchChange={setSearchValue}
        onChange={handleSelect}
        onDropdownOpen={() => setVisibleOptionsLimit(INITIAL_VISIBLE_OPTIONS)}
        filter={({ options }) => options}
        scrollAreaProps={{
          viewportProps: {
            onScroll: (event) => {
              const target = event.currentTarget;
              const remainingScroll =
                target.scrollHeight - target.scrollTop - target.clientHeight;

              if (remainingScroll <= LOAD_MORE_THRESHOLD_PX) {
                loadMoreOptions();
              }
            },
          },
        }}
        renderOption={({ option }) => {
          if (option.value === LOADING_OPTION_VALUE) {
            return (
              <div className={styles.loadingOption}>
                <Text size="sm" c="dimmed" fw={500} ta="center">
                  {option.label}
                </Text>
              </div>
            );
          }

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
      <StationStatusLegend freshYear={freshYear} />
    </div>
  );
};

export default StationForm;
