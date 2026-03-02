'use client';
import { useMemo, useState } from 'react';
import { Autocomplete, CloseButton } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { useStations } from '../../hooks/useStations';
import { useStationStore } from '../../hooks/useStationStore';

const StationForm = () => {
  const { stations } = useStations();
  const setSelectedStation = useStationStore((state) => state.setSelectedStation);
  const [value, setValue] = useState('');

  const stationsNames = useMemo(() => stations.map(station => ({label: station.fullName || '', value: station.id.toString()})), [stations]);

  const handleChange = useDebouncedCallback((newValue: string) => {
    const newSelectedStation = stations.find(
      (station) =>
        station.id.toString() === newValue ||
        station.fullName?.toLowerCase() === newValue.toLowerCase()
    );
    setSelectedStation(newSelectedStation || null);
  }, 300);

  const handleClear = () => {
    setValue('');
    setSelectedStation(null);
  };

  return (
    <div>
      <Autocomplete
        data={stationsNames}
        placeholder="Wpisz nazwę rzeki, miejscowości lub numer stacji..."
        value={value}
        onChange={(newValue) => {
          setValue(newValue);
          handleChange(newValue);
        }}
        rightSection={value ? <CloseButton onClick={handleClear} aria-label="Wyczyść" /> : null}
        rightSectionPointerEvents="all"
      />
    </div>
  );
}

export default StationForm;
