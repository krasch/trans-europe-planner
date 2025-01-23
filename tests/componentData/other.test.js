const { sortByDepartureTime } = require("./componentData");
const { createConnection } = require("./testData");

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
  sortByDepartureTime(connections);

  expect(connections).toStrictEqual([c1, c2, c3]);
});
