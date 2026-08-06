const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();

const aggregate = (values, statistic) => {
  if (values.length === 0) return null;
  if (statistic === "min") return Math.min(...values);
  if (statistic === "max") return Math.max(...values);

  const weightedValues = values.filter(
    (value) => value && typeof value === "object" && Number.isFinite(value.value) && Number.isFinite(value.weight)
  );

  if (weightedValues.length > 0) {
    const totalWeight = weightedValues.reduce((sum, { weight }) => sum + weight, 0);
    if (totalWeight === 0) return null;
    return weightedValues.reduce((sum, { value, weight }) => sum + value * weight, 0) / totalWeight;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

module.exports = { aggregate, daysInMonth };
