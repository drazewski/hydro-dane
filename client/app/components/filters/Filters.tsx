import { Checkbox, ComboboxItem, Loader, Radio, Select, Switch, Text } from "@mantine/core";
import { useStationStore } from "../../hooks/useStationStore";
import { RecordDataType, StationType } from "../../types/recordTypes";
import styles from "./filters.module.css";
import { useEffect, useMemo } from "react";
import { useAvailableYears } from "../../hooks/useAvailableYears";

interface Props {
  selectedStation: StationType;
}

const Filters = ({ selectedStation }: Props) => {
  const yearFrom = useStationStore((s) => s.yearFrom);
  const yearTo = useStationStore((s) => s.yearTo);
  const setYearFrom = useStationStore((s) => s.setYearFrom);
  const setYearTo = useStationStore((s) => s.setYearTo);
  const aggregations = useStationStore((state) => state.aggregation);
  const dataType = useStationStore((state) => state.dataType);
  const isMonthlyData = useStationStore((state) => state.isMonthlyData);
  const setMonthlyData = useStationStore((state) => state.setIsMonthlyData);
  const setSelectedDataType = useStationStore((state) => state.setSelectedDataType);
  const setAggregation = useStationStore((state) => state.setAggregation);
  const { years, isLoading, isError } = useAvailableYears(selectedStation?.id);

  const sortedYears = useMemo(() => [...years].sort((a, b) => a - b), [years]);

  useEffect(() => {
    if (!isLoading && sortedYears.length > 0) {
      setYearFrom(sortedYears[0].toString());
      setYearTo(sortedYears[sortedYears.length - 1].toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStation.id, isLoading]);

  const yearsOptions = useMemo(
    () => sortedYears.map((y) => ({ label: y.toString(), value: y.toString() })),
    [sortedYears]
  );

   const yearsOptionsFrom = useMemo(() => {
    return yearsOptions;
  }, [yearsOptions]);

  const yearsOptionsTo = useMemo(() => {
    const from = yearFrom ? Number(yearFrom) : undefined;
    const filtered = from
      ? yearsOptions.filter((opt) => Number(opt.value) >= from)
      : yearsOptions;
    return filtered;
  }, [yearsOptions, yearFrom]);

const handleYearFromChange = (_: string | null, option: ComboboxItem) => {
    const newFrom = option?.value ?? null;
    if (!newFrom) return;

    if (yearTo && Number(yearTo) < Number(newFrom)) {
      setYearTo(newFrom);
    }
    setYearFrom(newFrom);
  };

  const handleYearToChange = (_: string | null, option: ComboboxItem) => {
    const newTo = option?.value ?? null;
    if (!newTo) return;

    if (!yearFrom) {
      setYearFrom(newTo);
    } else if (Number(newTo) < Number(yearFrom)) {
      setYearTo(yearFrom);
      return;
    }
    setYearTo(newTo);
  };
  const handleDataTypeChange = (newDataType: string) => {
    setSelectedDataType(newDataType as RecordDataType);
  }

  return (
    <div>
      {isLoading ? (
        <Loader color="blue" size="xl" type="bars" className={styles.loader} />
      ) : isError ? (
        <Text c="red">Błąd ładowania danych. Spróbuj ponownie.</Text>
      ) : (
        <div className={styles.container}>
          <div className={styles.row}>
            <Text className={styles.rangeLabel}>Zakres danych</Text>
            <Select
              data={yearsOptionsFrom}
              placeholder="od"
              disabled={!sortedYears.length}
              classNames={{ option: styles.option, input: styles.option }}
              value={yearFrom ?? null}
              onChange={handleYearFromChange}
              w={100}
            />
            <Select
              data={yearsOptionsTo}
              placeholder="do"
              disabled={!sortedYears.length}
              classNames={{ option: styles.option, input: styles.option }}
              value={yearTo ?? null}
              onChange={handleYearToChange}
              w={100}
            />
            <Switch
              size="lg"
              label={isMonthlyData ? "Wartości miesięczne" : "Wartości roczne"}
              styles={{ label: { fontSize: 14 } }}
              onChange={(event) => setMonthlyData(event.currentTarget.checked)}
              value="yearly"
            />
          </div>
          <div className={styles.row}>
            <Radio.Group
              name="dataType"
              label="Typ danych"
              className={styles.inlineGroup}
              classNames={{ label: styles.rangeLabel }}
              value={dataType}
              onChange={handleDataTypeChange}
            >
              <Radio label="Stan wody (cm)" value={RecordDataType.level} />
              <Radio label="Przepływ (m3/s)" value={RecordDataType.flow} />
              <Radio label="Temperatura wody (°C)" value={RecordDataType.temperature} />
            </Radio.Group>
          </div>
          <div className={styles.row}>
            <Checkbox.Group
              label={"Wartości"}
              classNames={{ label: styles.rangeLabel }}
              value={aggregations}
              onChange={setAggregation}
              className={styles.inlineGroup}
            >
              <Checkbox value="max" label="Maksymalne" color="red"/>
              <Checkbox value="avg" label="Średnie" color="blue"/>
              <Checkbox value="min" label="Minimalne" color="black"/>
            </Checkbox.Group>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
