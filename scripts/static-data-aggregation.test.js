const test = require("node:test");
const assert = require("node:assert/strict");
const { aggregate, daysInMonth } = require("./static-data-aggregation");

test("uses the actual length of every calendar month", () => {
  assert.equal(daysInMonth(2023, 2), 28);
  assert.equal(daysInMonth(2024, 2), 29);
  assert.equal(daysInMonth(2024, 11), 30);
});

test("calculates a yearly average as a day-weighted monthly average", () => {
  const result = aggregate(
    [
      { value: 10, weight: 31 },
      { value: 20, weight: 29 },
    ],
    "avg"
  );

  assert.equal(result, (10 * 31 + 20 * 29) / 60);
});

test("keeps minimum and maximum aggregation unchanged", () => {
  assert.equal(aggregate([12, 4, 9], "min"), 4);
  assert.equal(aggregate([12, 4, 9], "max"), 12);
});
