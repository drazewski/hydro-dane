'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Loader, SegmentedControl, Text, ThemeIcon } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertCircle, IconRefresh, IconTemperature } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';
import { useStations } from '../hooks/useStations';
import { useStationStore } from '../hooks/useStationStore';
import { getStationMapData, type StationMapData } from '../services/stationMapService';
import { trackStationSelected } from '../components/analytics/analyticsEvents';
import { HISTORICAL_TEMPERATURE_COLOR } from '../components/stationForm/StationStatusIcons';
import type { StationType } from '../types/recordTypes';
import styles from './page.module.css';

const POLAND_BOUNDS: [[number, number], [number, number]] = [
  [49.0, 14.1],
  [54.9, 24.2],
];

type MappedStation = StationType & {
  latitude: number;
  longitude: number;
};

type StationFilter = 'all' | 'temperature' | 'freshTemperature';

const StationMap = () => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 600px)');
  const { stations, freshYear } = useStations();
  const setSelectedStation = useStationStore((state) => state.setSelectedStation);
  const dataType = useStationStore((state) => state.dataType);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import('leaflet') | null>(null);
  const [mapData, setMapData] = useState<StationMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState<StationFilter>('all');
  const [isMapReady, setIsMapReady] = useState(false);
  const [focusedStationId, setFocusedStationId] = useState<number | null>(null);

  const removeStationQueryParam = useCallback(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('station')) return;

    url.searchParams.delete('station');
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`
    );
  }, []);

  useEffect(() => {
    const stationId = Number(new URLSearchParams(window.location.search).get('station'));
    setFocusedStationId(Number.isInteger(stationId) && stationId > 0 ? stationId : null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(false);

    getStationMapData()
      .then((data) => {
        if (!cancelled) setMapData(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const mappedStations = useMemo<MappedStation[]>(() => {
    if (!mapData) return [];

    return stations.flatMap((station) => {
      const metadata = mapData.stations[station.id];
      return metadata ? [{ ...station, ...metadata }] : [];
    });
  }, [mapData, stations]);

  const temperatureStationsCount = useMemo(
    () => mappedStations.filter((station) => station.hasTemperatureData).length,
    [mappedStations]
  );
  const freshTemperatureStationsCount = useMemo(
    () => mappedStations.filter((station) => station.hasFreshTemperatureData).length,
    [mappedStations]
  );

  const filteredStations = useMemo(() => {
    if (filter === 'temperature') {
      return mappedStations.filter((station) => station.hasTemperatureData);
    }
    if (filter === 'freshTemperature') {
      return mappedStations.filter((station) => station.hasFreshTemperatureData);
    }
    return mappedStations;
  }, [filter, mappedStations]);

  const selectStation = useCallback(
    (station: StationType) => {
      setSelectedStation(station);
      trackStationSelected(station, dataType);
      router.push('/');
    },
    [dataType, router, setSelectedStation]
  );

  useEffect(() => {
    if (isLoading || error || !containerRef.current || mapRef.current) return;

    let cancelled = false;
    let map: LeafletMap | null = null;

    import('leaflet').then((leafletModule) => {
      if (cancelled || !containerRef.current) return;

      const L = leafletModule.default;
      leafletRef.current = L;
      map = L.map(containerRef.current, {
        minZoom: 5,
        maxZoom: 16,
        zoomControl: true,
      });
      mapRef.current = map;
      map.fitBounds(POLAND_BOUNDS, { padding: [8, 8] });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      setIsMapReady(true);
    });

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      leafletRef.current = null;
    };
  }, [error, isLoading]);

  useEffect(() => {
    const L = leafletRef.current;
    const markersLayer = markersLayerRef.current;
    if (!isMapReady || !L || !markersLayer) return;

    markersLayer.clearLayers();

    filteredStations.forEach((station) => {
      const isFocused = station.id === focusedStationId;
      const point = L.circleMarker([station.latitude, station.longitude], {
        radius: isFocused ? 8 : 5,
        weight: isFocused ? 3 : 2,
        color: '#ffffff',
        fillColor: isFocused ? '#e03131' : '#17679f',
        fillOpacity: isFocused ? 1 : 0.9,
      }).addTo(markersLayer);

      const tooltip = document.createElement('div');
      tooltip.className = styles.tooltipContent;

      const name = document.createElement('strong');
      name.textContent = station.name;
      tooltip.appendChild(name);

      const river = document.createElement('span');
      river.textContent = station.waterName;
      tooltip.appendChild(river);

      const details = document.createElement('span');
      details.textContent = `ID: ${station.id}`;
      tooltip.appendChild(details);

      point.bindTooltip(tooltip, {
        direction: 'top',
        offset: [0, -5],
        opacity: 1,
      });

      const activate = () => selectStation(station);
      point.on('click', activate);
      point.on('mouseover', () => {
        point.setStyle({ fillColor: '#e03131' });
        point.setRadius(7);
      });
      point.on('mouseout', () => {
        point.setStyle({ fillColor: isFocused ? '#e03131' : '#17679f' });
        point.setRadius(isFocused ? 8 : 5);
      });

      if (isFocused) {
        mapRef.current?.setView([station.latitude, station.longitude], 11, { animate: false });
        point.openTooltip();
        removeStationQueryParam();
      }

      const element = point.getElement();
      if (!element) return;

      element.setAttribute('role', 'link');
      element.setAttribute(
        'aria-label',
        `${station.name}, ${station.waterName}, ID ${station.id}`
      );
      element.addEventListener('keydown', (event) => {
        const keyboardEvent = event as KeyboardEvent;
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });
  }, [filteredStations, focusedStationId, isMapReady, removeStationQueryParam, selectStation]);

  if (isLoading) {
    return (
      <div className={styles.mapState}>
        <Loader size="sm" />
        <Text c="dimmed">Wczytywanie stacji…</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={20} />} title="Nie udało się wczytać mapy" color="red">
        <Text size="sm" mb="sm">Spróbuj ponownie za chwilę.</Text>
        <Button
          size="xs"
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={() => setReloadKey((value) => value + 1)}
        >
          Wczytaj ponownie
        </Button>
      </Alert>
    );
  }

  return (
    <>
      <div className={styles.filters}>
        <Text size="sm" fw={600}>Pokaż stacje</Text>
        <SegmentedControl
          value={filter}
          onChange={(value) => {
            removeStationQueryParam();
            setFocusedStationId(null);
            setFilter(value as StationFilter);
          }}
          aria-label="Filtr stacji na mapie"
          className={styles.segmentedControl}
          orientation={isMobile ? 'vertical' : 'horizontal'}
          fullWidth={isMobile}
          data={[
            {
              value: 'all',
              label: `Wszystkie (${mappedStations.length})`,
            },
            {
              value: 'temperature',
              label: (
                <span className={styles.filterLabel}>
                  <ThemeIcon component="span" variant="transparent" color={HISTORICAL_TEMPERATURE_COLOR} size="sm" radius="xl">
                    <IconTemperature size={15} />
                  </ThemeIcon>
                  Dane temperatury ({temperatureStationsCount})
                </span>
              ),
            },
            {
              value: 'freshTemperature',
              label: (
                <span className={styles.filterLabel}>
                  <ThemeIcon component="span" variant="filled" color="blue" size="sm" radius="xl">
                    <IconTemperature size={15} />
                  </ThemeIcon>
                  Temperatura {freshYear} ({freshTemperatureStationsCount})
                </span>
              ),
            },
          ]}
        />
      </div>
      <div
        ref={containerRef}
        className={styles.map}
        aria-label={`Interaktywna mapa ${filteredStations.length} stacji hydrologicznych w Polsce`}
      />
      <Text size="xs" c="dimmed" mt="xs">
        Widoczne stacje: {filteredStations.length} z {mappedStations.length}. Mapa obejmuje stacje działające w ostatnim dostępnym roku danych archiwalnych ({freshYear}).
      </Text>
    </>
  );
};

export default StationMap;
