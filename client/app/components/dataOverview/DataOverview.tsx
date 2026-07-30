'use client';

import { Text } from '@mantine/core';
import { useStationStore } from '../../hooks/useStationStore';
import styles from './dataOverview.module.css';

const DataOverview = () => {
  const requestStationPickerAttention = useStationStore((state) => state.requestStationPickerAttention);

  return (
    <section aria-label="Opis dostępnych danych hydrologicznych">
      <Text size="sm" c="black">
      Dane w aplikacji HydroDane obejmują lata hydrologiczne 1950–2024 i dane z 1 301 stacji pomiarowych w Polsce. Pomiary
      poziomu wody są dostępne dla 1 207 stacji, przepływu dla 1 287, a temperatury wody dla 267.
      <br />
      <br />
      Po wybraniu stacji można oglądać roczne wartości minimalne, średnie i maksymalne, pełny przebieg miesięczny
      albo dane tylko dla wybranego miesiąca — na przykład wszystkie stycznie w dostępnych latach.{' '}
        <button
          type="button"
          className={styles.stationPickerHint}
          onClick={requestStationPickerAttention}
          onMouseEnter={requestStationPickerAttention}
        >
          Wybierz stację w polu góry
        </button>{' '}
        aby rozpocząć analizę.
      </Text>
    </section>
  );
};

export default DataOverview;
