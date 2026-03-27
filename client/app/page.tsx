'use client';

import { QueryClient, QueryClientProvider } from "react-query";
import styles from "./page.module.css";
import Filters from "./components/filters/Filters";
import StationForm from "./components/stationForm/StationForm";
import { useStationStore } from "./hooks/useStationStore";
import Charts from "./components/charts/Charts";
import ExtremumTable from "./components/extremumTable/ExtremumTable";
import Header from "./components/header/Header";
import { Footer } from "./components/footer/Footer";

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
  const selectedStation = useStationStore((state) => state.station);
  const selectedYearFrom = useStationStore((state) => state.yearFrom);
  const selectedYearTo = useStationStore((state) => state.yearTo);
  const selectedType = useStationStore((state) => state.dataType);

  return (
    <QueryClientProvider client={queryClient}>
      <Header />
      <main className={styles.main}>
        <div className={`${styles.titleWrapper} ${selectedStation ? styles.selected : ""}`}>
          <h2 className={styles.title}>
            {selectedStation ? `${selectedStation.waterName} - ${selectedStation.name.toUpperCase()}` : 'Wybierz stację pomiarową'}
            {selectedStation && <span className={styles.stationId}>({selectedStation.id})</span>}
          </h2>
          <StationForm />
        </div>
        {selectedStation && <Filters selectedStation={selectedStation} />}
        {selectedStation && selectedYearFrom && selectedYearTo && selectedType && (
          <div className={styles.subtitleWrapper}>
            {/* {selectedStation && (
            <div className={styles.subtitleWrapper}>
              <span>Stacja pomiarowa:</span>
              <span className={styles.name}>
                <strong>{`${selectedStation.waterName} - ${selectedStation.name.toLowerCase()} (${selectedStation.id})`}</strong>
              </span>
            </div>
          )} */}
            <Charts
              selectedStation={selectedStation} 
              selectedType={selectedType}
            />
            <ExtremumTable
              selectedStation={selectedStation}
            />
          </div>
        )}
      </main>
      <Footer />
    </QueryClientProvider>
  );
}
