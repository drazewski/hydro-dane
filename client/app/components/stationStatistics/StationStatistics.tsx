'use client';

import { Paper, Text } from '@mantine/core';
import CharacteristicFlows from '../characteristicFlows/CharacteristicFlows';
import ExtremumTable from '../extremumTable/ExtremumTable';
import { StationType } from '../../types/recordTypes';
import { useStationDetails } from '../../hooks/useStationDetails';
import styles from './stationStatistics.module.css';

interface Props {
  selectedStation: StationType;
}

const formatCoordinate = (value: string | null, direction: 'N' | 'E') => {
  if (!value) return '—';
  const [degrees, minutes, seconds] = value.split(/\s+/);
  return degrees && minutes && seconds ? `${degrees}° ${minutes}′ ${seconds}″ ${direction}` : value;
};

const formatNumber = (value: number | null, suffix: string) =>
  value == null ? '—' : `${value.toLocaleString('pl-PL', { maximumFractionDigits: 3 })} ${suffix}`;

const StationStatistics = ({ selectedStation }: Props) => {
  const { data: detailsByStation } = useStationDetails();
  const details = detailsByStation?.[selectedStation.id];
  const stationDetails = [
    ['Rok założenia', details?.yearEstablished?.toString() ?? '—'],
    ['Szerokość geograficzna', formatCoordinate(details?.latitude ?? null, 'N')],
    ['Długość geograficzna', formatCoordinate(details?.longitude ?? null, 'E')],
    ['Rzędna zera wodowskazu', formatNumber(details?.gaugeZero ?? null, 'm n.p.m.')],
    ['Kilometr biegu rzeki', formatNumber(details?.riverKilometre ?? null, 'km')],
  ] as const;

  return (
    <Paper withBorder radius="md" p="md" mt="xl" className={styles.container}>
      <div className={styles.header}>
        <div>
          <Text fw={600}>Zestawienie hydrologiczne stacji</Text>
          <Text size="sm" c="dimmed">
            {selectedStation.waterName} — {selectedStation.name.toUpperCase()}
          </Text>
        </div>
        {details && (
          <dl className={styles.details}>
            {stationDetails.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className={styles.tables}>
        <CharacteristicFlows selectedStation={selectedStation} />
        <ExtremumTable selectedStation={selectedStation} />
      </div>
    </Paper>
  );
};

export default StationStatistics;
