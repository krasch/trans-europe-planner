const {
  prepareDataForPerlschnur,
  getColor,
  humanReadableTimedelta,
  dateString,
} = require("../../script/components/componentData.js");
const { Journey, JourneyCollection } = require("../../script/types/journey.js");
const { Database } = require("../../script/database.js");
const { createConnection } = require("../../tests/data.js");

test("prepareDataForPerlschnurEmpty", function () {
  const database = new Database([]);

  const journeys = new JourneyCollection();

  const got = prepareDataForPerlschnur(journeys, database);
  expect(got).toStrictEqual({ summary: {}, connections: [], transfers: [] });
});

test("prepareDataForPerlschnurNoActiveJourney", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);

  const database = new Database([c1]);

  const journeys = new JourneyCollection();
  journeys.addJourney([c1.id]);

  const got = prepareDataForPerlschnur(journeys, database);
  expect(got).toStrictEqual({ summary: {}, connections: [], transfers: [] });
});

test("prepareDataForPerlschnurSingleConnection", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);

  const j1 = new Journey([c1.uniqueId]);
  const database = new Database([c1]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.setActive(j1.id);

  const exp = {
    summary: {
      from: "City1",
      to: "City2",
      via: "",
      totalTime: humanReadableTimedelta(60),
    },
    connections: [
      {
        color: getColor(0),
        type: c1.type,
        name: c1.name,
        travelTime: humanReadableTimedelta(60),
        stops: [
          {
            time: "06:00",
            station: "City 1 Main Station",
          },
          {
            time: "07:00",
            station: "City 2 Main Station",
          },
        ],
      },
    ],
    transfers: [],
  };

  const got = prepareDataForPerlschnur(journeys, database);
  expect(got).toEqual(exp);
});

test("prepareDataForPerlschnurMultipleConnections", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-15", "09:00", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-15", "10:00", "city3MainStationId"],
    ["2024-10-15", "11:00", "city4MainStationId"],
  ]);

  const j1 = new Journey([c1.uniqueId, c2.uniqueId, c3.uniqueId]);
  const database = new Database([c1, c2, c3]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.setActive(j1.id);

  const exp = {
    summary: {
      from: "City1",
      to: "City4",
      via: "via City2, City3",
      totalTime: humanReadableTimedelta(5 * 60),
    },
    connections: [
      {
        color: getColor(0),
        type: c1.type,
        name: c1.name,
        travelTime: humanReadableTimedelta(60),
        stops: [
          {
            time: "06:00",
            station: "City 1 Main Station",
          },
          {
            time: "07:00",
            station: "City 2 Main Station",
          },
        ],
      },
      {
        color: getColor(1),
        type: c2.type,
        name: c2.name,
        travelTime: humanReadableTimedelta(60),
        stops: [
          {
            time: "08:00",
            station: "City 2 Main Station",
          },
          {
            time: "09:00",
            station: "City 3 Main Station",
          },
        ],
      },
      {
        color: getColor(2),
        type: c2.type,
        name: c2.name,
        travelTime: humanReadableTimedelta(60),
        stops: [
          {
            time: "10:00",
            station: "City 3 Main Station",
          },
          {
            time: "11:00",
            station: "City 4 Main Station",
          },
        ],
      },
    ],
    transfers: [
      { time: humanReadableTimedelta(60) },
      { time: humanReadableTimedelta(60) },
    ],
  };

  const got = prepareDataForPerlschnur(journeys, database);
  expect(got).toEqual(exp);
});

test("prepareDataForPerlschnurMultipleConnectionsMultipleDays", function () {
  const c1 = createConnection([
    ["2024-10-15", "06:00", "city1MainStationId"],
    ["2024-10-15", "07:00", "city2MainStationId"],
  ]);
  const c2 = createConnection([
    ["2024-10-15", "08:00", "city2MainStationId"],
    ["2024-10-16", "09:00", "city3MainStationId"],
  ]);
  const c3 = createConnection([
    ["2024-10-17", "10:00", "city3MainStationId"],
    ["2024-10-17", "11:00", "city4MainStationId"],
  ]);

  const j1 = new Journey([c1.uniqueId, c2.uniqueId, c3.uniqueId]);
  const database = new Database([c1, c2, c3]);

  const journeys = new JourneyCollection();
  journeys.addJourney(j1);
  journeys.setActive(j1.id);

  const exp = {
    summary: {
      from: "City1",
      to: "City4",
      via: "via City2, City3",
      totalTime: humanReadableTimedelta(48 * 60 + 5 * 60),
    },
    connections: [
      {
        color: getColor(0),
        type: c1.type,
        name: c1.name,
        travelTime: humanReadableTimedelta(60),
        stops: [
          {
            time: "06:00",
            station: "City 1 Main Station",
          },
          {
            time: "07:00",
            station: "City 2 Main Station",
          },
        ],
      },
      {
        color: getColor(1),
        type: c2.type,
        name: c2.name,
        travelTime: humanReadableTimedelta(24 * 60 + 60),
        stops: [
          {
            time: "08:00",
            station: "City 2 Main Station",
          },
          {
            date: dateString(new Date("2024-10-16")),
            time: "09:00",
            station: "City 3 Main Station",
          },
        ],
      },
      {
        color: getColor(2),
        type: c2.type,
        name: c2.name,
        travelTime: humanReadableTimedelta(60),
        stops: [
          {
            date: dateString(new Date("2024-10-17")),
            time: "10:00",
            station: "City 3 Main Station",
          },
          {
            time: "11:00",
            station: "City 4 Main Station",
          },
        ],
      },
    ],
    transfers: [
      { time: humanReadableTimedelta(60) },
      { time: humanReadableTimedelta(24 * 60 + 60) },
    ],
  };

  const got = prepareDataForPerlschnur(journeys, database);
  expect(got).toEqual(exp);
});
