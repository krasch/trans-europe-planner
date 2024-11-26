const {
  sortConnectionsByDeparture,
  getJourneySummary,
} = require("../script/components/componentData.js");
const { createConnection } = require("../tests/data.js");

test("sortConnectionsByDeparture", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "06:00", "city1MainStationId"],
    ["2024-10-16", "07:00", "city2MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-16", "22:00", "city1MainStationId"],
    ["2024-10-16", "22:00", "city2MainStationId"],
  ]);

  const connections = [c3, c1, c2];
  expect(sortConnectionsByDeparture(connections)).toStrictEqual([c1, c2, c3]);
});

test("getJourneySummaryNoVias", function () {
  const c = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);

  // no VIA's
  const exp = {
    from: "City1",
    to: "City2",
    via: "",
    travelTime: "9min",
  };
  expect(getJourneySummary([c])).toStrictEqual(exp);
});

test("getJourneySummaryOneVia", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);

  const c2 = createConnection([
    ["2024-10-15", "07:01", "city2MainStationId"],
    ["2024-10-15", "07:10", "city3MainStationId"],
  ]);

  const exp = {
    from: "City1",
    to: "City3",
    via: " via City2",
    travelTime: "1h 9min",
  };
  expect(getJourneySummary([c1, c2])).toStrictEqual(exp);
});

test("getJourneySummaryTwoVias", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:01", "city1MainStationId"],
    ["2024-10-15", "06:10", "city2MainStationId"],
  ]);

  const c2 = createConnection([
    ["2024-10-15", "07:01", "city2MainStationId"],
    ["2024-10-15", "07:10", "city3MainStationId"],
  ]);

  const c3 = createConnection([
    ["2024-10-15", "08:01", "city3MainStationId"],
    ["2024-10-15", "08:10", "city4MainStationId"],
  ]);

  const exp = {
    from: "City1",
    to: "City4",
    via: " via City2, City3",
    travelTime: "2h 9min",
  };
  expect(getJourneySummary([c1, c2, c3])).toStrictEqual(exp);
});
