const test = require('node:test');
const assert = require('node:assert/strict');

const { parseCoordinate } = require('./export-map-data');

test('converts DMS coordinates used by the station register', () => {
  assert.equal(parseCoordinate('49 59 37'), 49 + 59 / 60 + 37 / 3600);
  assert.equal(parseCoordinate('18 17 14'), 18 + 17 / 60 + 14 / 3600);
  assert.equal(parseCoordinate(''), null);
  assert.equal(parseCoordinate('invalid'), null);
});
