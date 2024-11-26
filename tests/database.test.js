const { Database } = require("../script/database.js");
const { Leg } = require("../script/types/connection.js");
const { createConnection } = require("../tests/data.js");

test("getConnectionsForLeg", function () {
  const c1 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);

  const c2 = createConnection([
    ["2024-10-15", "08:00", "city1MainStationId"],
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);

  const c3 = createConnection([
    ["2024-10-15", "08:00", "city4MainStationId"],
    ["2024-10-16", "09:00", "city1MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);

  const database = new Database([c1, c2, c3]);
  const got = database.connectionsForLeg(new Leg("City1", "City3"));

  const exp = [c1.slice("City1", "City3"), c3.slice("City1", "City3")];
  expect(got).toStrictEqual(exp);
});
