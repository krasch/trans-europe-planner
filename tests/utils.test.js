import { createConnection } from "tests/data.js";
import { sortConnectionsByDepartureTime } from "/script/util.js";

test("sortByDepartureTime", function () {
  const c1 = createConnection([
    ["2024-10-15", "16:00", "city1MainStationId"],
    ["2024-10-15", "17:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-13", "18:00", "city1MainStationId"],
    ["2024-10-13", "19:00", "city2MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-15", "07:00", "city1MainStationId"],
    ["2024-10-15", "08:00", "city2MainStationId"],
  ]);

  const connections = [c1, c2, c3];
  sortConnectionsByDepartureTime(connections);

  expect(connections).toStrictEqual([c2, c3, c1]);
});
