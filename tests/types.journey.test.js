const { createConnection } = require("../tests/data.js");
const { Journey, JourneyError } = require("../script/types/journey.js");

test("testInit", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "08:00", "city2MainStationId"],
    ["2024-10-16", "09:00", "city3MainStationId"],
  ]);

  const journey = new Journey(0, [c1.id, c2.id]);

  expect(journey.legs).toStrictEqual([c1.leg, c2.leg]);
  expect(journey.connectionIds).toStrictEqual([c1.id, c2.id]);
  expect(journey.start).toBe("City1");
  expect(journey.destination).toBe("City3");
});

test("testSetConnectionUnknownLeg", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "07:00", "city2MainStationId"],
    ["2024-10-15", "08:00", "city3MainStationId"],
  ]);

  const journey = new Journey(0, [c1.id]);
  expect(() => journey.updateLeg(c2.id)).toThrow(JourneyError);
});

test("testSetConnectionKnownLeg", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-16", "08:00", "city2MainStationId"],
    ["2024-10-16", "09:00", "city3MainStationId"],
  ]);
  const c2_alt = createConnection([
    ["2024-10-16", "09:00", "city2MainStationId"],
    ["2024-10-16", "10:00", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-16", "12:00", "city3MainStationId"],
    ["2024-10-16", "13:00", "city4MainStationId"],
  ]);

  const journey = new Journey(0, [c1.id, c2.id, c3.id]);
  journey.updateLeg(c2_alt.id);

  expect(journey.legs).toStrictEqual([c1.leg, c2.leg, c3.leg]);
  expect(journey.connectionIds).toStrictEqual([c1.id, c2_alt.id, c3.id]);
});
