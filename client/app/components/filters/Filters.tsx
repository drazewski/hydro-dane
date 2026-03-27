import { Checkbox, ComboboxItem, Loader, Select, Switch, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useStationStore } from "../../hooks/useStationStore";
import { RecordDataType, StationType } from "../../types/recordTypes";
import styles from "./filters.module.css";
import { useEffect, useMemo } from "react";
import { useMonthlyRecords } from "../../hooks/useMonthlyRecords";
import { useYearlyRecords } from "../../hooks/useYearlyRecords";

interface Props {
  selectedStation: StationType;
}

const Filters = ({ selectedStation }: Props) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const DATA_TYPE_OPTIONS = [
    { label: "Stan wody", value: RecordDataType.level },
    { label: "Przepływ", value: RecordDataType.flow },
    { label: isMobile ? "Temp. wody" : "Temperatura wody", value: RecordDataType.temperature },
  ];

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
  const { availableData: monthlyAvailable, isLoading: loadingMonthly, isError: errorMonthly } = useMonthlyRecords(selectedStation.id, isMonthlyData);
  const { availableData: yearlyAvailable, isLoading: loadingYearly, isError: errorYearly } = useYearlyRecords(selectedStation.id, isMonthlyData);

  const isLoading = isMonthlyData ? loadingMonthly : loadingYearly;
  const isError = isMonthlyData ? errorMonthly : errorYearly;

  const sortedYears = useMemo(() => {
    const years = isMonthlyData ? monthlyAvailable.years : yearlyAvailable.years;
    return [...years].sort((a, b) => a - b);
  }, [isMonthlyData, monthlyAvailable.years, yearlyAvailable.years]);

  useEffect(() => {
    if (!isLoading && !yearFrom && sortedYears.length > 0) {
      setYearFrom(String(sortedYears[0]));
      setYearTo(String(sortedYears[sortedYears.length - 1]));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, yearFrom, sortedYears]);

  const yearsOptions = useMemo(
    () => sortedYears.map((y) => ({ label: y.toString(), value: y.toString() })),
    [sortedYears]
  );

  const yearsOptionsFrom = useMemo(() => yearsOptions, [yearsOptions]);

  const yearsOptionsTo = useMemo(() => {
    const from = yearFrom ? Number(yearFrom) : undefined;
    return from ? yearsOptions.filter((opt) => Number(opt.value) >= from) : yearsOptions;
  }, [yearsOptions, yearFrom]);

  const handleYearFromChange = (_: string | null, option: ComboboxItem) => {
    const newFrom = option?.value ?? null;
    if (!newFrom) return;
    if (yearTo && Number(yearTo) < Number(newFrom)) setYearTo(newFrom);
    setYearFrom(newFrom);
  };

  const handleYearToChange = (_: string | null, option: ComboboxItem) => {
    const newTo = option?.value ?? null;
    if (!newTo) return;
    if (!yearFrom) { setYearFrom(newTo); }
    else if (Number(newTo) < Number(yearFrom)) { setYearTo(yearFrom); return; }
    setYearTo(newTo);
  };

  return (
    <div>
      {isLoading ? (
        <Loader color="blue" size="xl" type="bars" className={styles.loader} />
      ) : isError ? (
        <Text c="red">Błąd ładowania danych. Spróbuj ponownie.</Text>
      ) : (
        <div className={styles.container}>
          <div className={styles.row}>
            <Text className={styles.rangeLabel}>Zakres danych:</Text>
            <Select
              data={DATA_TYPE_OPTIONS}
              value={dataType}
              onChange={(v) => v && setSelectedDataType(v as RecordDataType)}
              styles={{ input: { height: 25, minHeight: 25 } }}
              w={128}
            />
            <div className={styles.floatingWrapper}>
              <span className={styles.floatingLabel}>od</span>
              <Select
                data={yearsOptionsFrom}
                placeholder="od"
                disabled={!sortedYears.length}
                classNames={{ option: styles.option, input: styles.option }}
                styles={{ input: { height: 25, minHeight: 25 } }}
                value={yearFrom ?? null}
                onChange={handleYearFromChange}
                w={82}
              />
            </div>
            <div className={styles.floatingWrapper}>
              <span className={styles.floatingLabel}>do</span>
              <Select
                data={yearsOptionsTo}
                placeholder="do"
                disabled={!sortedYears.length}
                classNames={{ option: styles.option, input: styles.option }}
                styles={{ input: { height: 25, minHeight: 25 } }}
                value={yearTo ?? null}
                onChange={handleYearToChange}
                w={82}
              />
            </div>
            {!isMobile && (
              <Switch
                size="md"
                label={isMonthlyData ? "Wartości miesięczne" : "Wartości roczne"}
                styles={{ label: { fontSize: 14, whiteSpace: "nowrap" } }}
                checked={isMonthlyData}
                onChange={(event) => setMonthlyData(event.currentTarget.checked)}
              />
            )}
          </div>
          <div className={styles.rowNoGap}>
            <Checkbox.Group
              label={"Wartości:"}
              classNames={{ label: styles.rangeLabel }}
              value={aggregations}
              onChange={(value) => setAggregation(value as ("min" | "avg" | "max")[])}
              className={styles.inlineGroup}
            >
              <Checkbox value="max" label={isMobile ? "Maks." : "Maksymalne"} color="red"/>
              <Checkbox value="avg" label={isMobile ? "Śr." : "Średnie"} color="blue"/>
              <Checkbox value="min" label={isMobile ? "Min." : "Minimalne"} color="black"/>
            </Checkbox.Group>
            {isMobile && (
              <Switch
                size="md"
                label={isMonthlyData ? "Miesięczne" : "Roczne"}
                styles={{ label: { fontSize: 14, whiteSpace: "nowrap" } }}
                checked={isMonthlyData}
                onChange={(event) => setMonthlyData(event.currentTarget.checked)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;
