'use client';

import { QueryClient, QueryClientProvider } from "react-query";
import { useEffect } from "react";
import styles from "./page.module.css";
import Filters from "./components/filters/Filters";
import StationForm from "./components/stationForm/StationForm";
import { useStationStore } from "./hooks/useStationStore";
import Charts from "./components/charts/Charts";
import StationStatistics from "./components/stationStatistics/StationStatistics";
import Header from "./components/header/Header";
import { Footer } from "./components/footer/Footer";
import { WITHDRAWN_STATION_IDS } from "./constants/withdrawnStations";
import DataOverview from "./components/dataOverview/DataOverview";
import { useStations } from "./hooks/useStations";
import { RecordDataType } from "./types/recordTypes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

export default function Home() {
  const { stations } = useStations();
  const selectedStation = useStationStore((state) => state.station);
  const selectedYearFrom = useStationStore((state) => state.yearFrom);
  const selectedYearTo = useStationStore((state) => state.yearTo);
  const selectedType = useStationStore((state) => state.dataType);
  const stationPickerEditing = useStationStore((state) => state.stationPickerEditing);
  const startStationPickerEditing = useStationStore((state) => state.startStationPickerEditing);
  const hasWithdrawnData = selectedStation ? WITHDRAWN_STATION_IDS.has(selectedStation.id) : false;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stationId = Number(params.get('station'));

    if (!stationId) return;

    const station = stations.find((item) => item.id === stationId);
    if (!station) return;

    const dataType = params.get('type');
    const frequency = params.get('frequency');
    const monthlyMode = params.get('monthMode');
    const chartView = params.get('view');
    const month = params.get('month');
    const series = params.get('series')?.split(',').filter(
      (value): value is 'min' | 'avg' | 'max' => ['min', 'avg', 'max'].includes(value)
    );
    const trend = params.get('trend');
    const store = useStationStore.getState();

    store.setSelectedStation(station);
    store.setYearFrom(params.get('from'));
    store.setYearTo(params.get('to'));
    if (Object.values(RecordDataType).includes(dataType as RecordDataType)) {
      store.setSelectedDataType(dataType as RecordDataType);
    }
    store.setIsMonthlyData(frequency === 'monthly');
    if (monthlyMode === 'all' || monthlyMode === 'single') store.setMonthlyMode(monthlyMode);
    if (chartView === 'line' || chartView === 'heatmap') store.setChartView(chartView);
    if (month && Number(month) >= 1 && Number(month) <= 12) store.setSelectedMonth(month);
    if (series?.length) store.setAggregation(series);
    if (trend === 'none' || trend === 'min' || trend === 'avg' || trend === 'max') store.setTrendLine(trend);

    window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
  }, [stations]);

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main className={styles.main}>
        <div className={`${styles.titleWrapper} ${selectedStation ? styles.selected : ""}`}>
          {selectedStation && !stationPickerEditing ? (
            <button type="button" className={styles.stationTitleButton} onClick={startStationPickerEditing}>
              {selectedStation.waterName} - {selectedStation.name.toUpperCase()}
              <span className={styles.stationId}>({selectedStation.id})</span>
            </button>
          ) : !selectedStation ? (
            <h2 className={styles.title}>Wybierz stację pomiarową</h2>
          ) : null}
          <StationForm />
        </div>
        {!selectedStation && <DataOverview />}
        {selectedStation && <Filters selectedStation={selectedStation} />}
        {selectedStation && selectedYearFrom && selectedYearTo && selectedType && (
          <div className={styles.subtitleWrapper}>
            <Charts
              selectedStation={selectedStation} 
              selectedType={selectedType}
            />
            {!hasWithdrawnData && (
              <StationStatistics selectedStation={selectedStation} />
            )}
          </div>
        )}
      </main>
      <Footer />
    </QueryClientProvider>
  );
}
