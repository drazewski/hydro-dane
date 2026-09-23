import { ScrollArea, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import type { CSSProperties } from 'react';
import { MonthlyStructuredRecordType, RecordDataType } from '../../types/recordTypes';
import styles from './monthlyHeatmap.module.css';

type Aggregation = 'min' | 'avg' | 'max';

interface Props {
  data: MonthlyStructuredRecordType[];
  selectedType: RecordDataType;
  aggregation: Aggregation[];
  fitToWidth?: boolean;
}

const monthLabels = [
  'Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru',
];

const units: Record<RecordDataType, string> = {
  [RecordDataType.level]: 'cm',
  [RecordDataType.flow]: 'm³/s',
  [RecordDataType.temperature]: '°C',
};

const getAggregation = (aggregation: Aggregation[]): Aggregation =>
  aggregation.includes('avg') ? 'avg' : aggregation.includes('max') ? 'max' : 'min';

const getValueKey = (selectedType: RecordDataType, aggregation: Aggregation) =>
  `${aggregation}${selectedType.charAt(0).toUpperCase()}${selectedType.slice(1)}` as keyof MonthlyStructuredRecordType;

const getColor = (value: number, min: number, max: number) => {
  const ratio = max === min ? 0.65 : (value - min) / (max - min);
  const lightness = 93 - ratio * 52;
  return `hsl(207 82% ${lightness}%)`;
};

const temperatureStops = [
  { value: 0, color: [75, 160, 233] },
  { value: 5, color: [126, 186, 241] },
  { value: 10, color: [227, 242, 253] },
  { value: 15, color: [255, 249, 196] },
  { value: 18, color: [255, 212, 59] },
  { value: 21, color: [255, 146, 43] },
  { value: 24, color: [240, 62, 62] },
  { value: 27, color: [172, 34, 34] },
];

const temperatureGradient =
  'linear-gradient(90deg, #4ba0e9 0%, #7ebaf1 18.8%, #e3f2fd 38.7%, #fff9c4 55.5%, #ffd43b 69%, #ff922b 80.5%, #f03e3e 91%, #ac2222 100%)';

const interpolateColor = (from: number[], to: number[], ratio: number) =>
  from.map((component, index) => Math.round(component + (to[index] - component) * ratio));

const getTemperatureColor = (value: number) => {
  if (value <= temperatureStops[0].value) return `rgb(${temperatureStops[0].color.join(' ')})`;

  const lastStop = temperatureStops[temperatureStops.length - 1];
  if (value >= lastStop.value) return `rgb(${lastStop.color.join(' ')})`;

  const upperIndex = temperatureStops.findIndex((stop) => stop.value >= value);
  const lowerStop = temperatureStops[upperIndex - 1];
  const upperStop = temperatureStops[upperIndex];
  const ratio = (value - lowerStop.value) / (upperStop.value - lowerStop.value);
  return `rgb(${interpolateColor(lowerStop.color, upperStop.color, ratio).join(' ')})`;
};

const formatValue = (value: number, selectedType: RecordDataType) =>
  `${value.toLocaleString('pl-PL', { maximumFractionDigits: selectedType === RecordDataType.flow ? 2 : 1 })} ${units[selectedType]}`;

const FIT_LABEL_WIDTH = 30;
const DEFAULT_GAP = 2;
const MIN_FIT_ROW_HEIGHT = 4;
const MAX_CELL_SIZE = 22;

const MonthlyHeatmap = ({ data, selectedType, aggregation, fitToWidth = false }: Props) => {
  const { ref: wrapperRef, width: wrapperWidth } = useElementSize<HTMLDivElement>();
  const selectedAggregation = getAggregation(aggregation);
  const valueKey = getValueKey(selectedType, selectedAggregation);
  const years = Array.from(new Set(data.map((entry) => entry.year))).sort((left, right) => left - right);
  const values = data
    .map((entry) => entry[valueKey])
    .filter((value): value is number => typeof value === 'number');
  const min = values.length > 0 ? Math.min(...values) : 0;
  const max = values.length > 0 ? Math.max(...values) : 0;
  const isTemperature = selectedType === RecordDataType.temperature;
  const recordsByDate = new Map(data.map((entry) => [`${entry.year}-${entry.month}`, entry]));
  const fitColumnSlot = years.length > 0 && wrapperWidth > FIT_LABEL_WIDTH
    ? (wrapperWidth - FIT_LABEL_WIDTH) / years.length
    : MAX_CELL_SIZE + DEFAULT_GAP;
  const fitGap = Math.min(DEFAULT_GAP, Math.max(0.25, fitColumnSlot * 0.12));
  const fitCellWidth = Math.max(0, fitColumnSlot - fitGap);
  const fitRowHeight = Math.min(MAX_CELL_SIZE, Math.max(MIN_FIT_ROW_HEIGHT, fitCellWidth));
  const gridStyle = {
    gridTemplateColumns: fitToWidth
      ? `30px repeat(${years.length}, minmax(0, 1fr))`
      : `44px repeat(${years.length}, 22px)`,
    gridTemplateRows: fitToWidth ? `44px repeat(${monthLabels.length}, ${fitRowHeight}px)` : undefined,
    gap: fitToWidth ? `${fitGap}px` : undefined,
    '--heatmap-fit-row-height': `${fitRowHeight}px`,
  } as CSSProperties;

  if (years.length === 0 || values.length === 0) {
    return <Text c="dimmed">Brak danych do wyświetlenia w kalendarzu.</Text>;
  }

  return (
    <div ref={wrapperRef} className={`${styles.wrapper} ${fitToWidth ? styles.fitToWidth : ''}`}>
      <ScrollArea type="auto" offsetScrollbars>
        <div className={styles.grid} style={gridStyle}>
          <div />
          {years.map((year) => (
            <div className={styles.year} key={year}>{year}</div>
          ))}
          {monthLabels.map((monthLabel, monthIndex) => (
            <div className={styles.monthRow} key={monthLabel}>
              <div className={styles.month}>{monthLabel}</div>
              {years.map((year) => {
                const entry = recordsByDate.get(`${year}-${monthIndex + 1}`);
                const value = entry?.[valueKey];
                const hasValue = typeof value === 'number';
                return (
                  <div
                    className={`${styles.cell} ${hasValue ? '' : styles.missing}`}
                    key={`${year}-${monthIndex + 1}`}
                    style={
                      hasValue
                        ? { backgroundColor: isTemperature ? getTemperatureColor(value) : getColor(value, min, max) }
                        : undefined
                    }
                    title={`${monthLabel} ${year}: ${hasValue ? formatValue(value, selectedType) : 'brak danych'}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className={styles.legend} aria-label="Skala wartości">
        {isTemperature ? (
          <>
            <span>0°C</span>
            <span className={styles.gradient} style={{ background: temperatureGradient }} />
            <span>≥27°C</span>
          </>
        ) : (
          <>
            <span>{formatValue(min, selectedType)}</span>
            <span className={styles.gradient} />
            <span>{formatValue(max, selectedType)}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyHeatmap;
