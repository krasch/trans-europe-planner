/**
 * @jest-environment jsdom
 */
import { jest } from "@jest/globals";

import { GeoDatabase } from "script/data/geoDatabase.js";
import { main } from "script/main.js";
import { Itinerary } from "script/types/itinerary.js";

import { DAY1, connectionFromShorthand as _c } from "tests/_helpers/data.js";

const testCities = {
  C1: { name: "City1", geo: { latitude: 10, longitude: 10 } },
  C2: { name: "City2", geo: { latitude: 20, longitude: 20 } },
  C3: { name: "City3", geo: { latitude: 30, longitude: 30 } },
};

const testStops = {
  S1: {
    name: "Stop1",
    geo: { latitude: 10, longitude: 10 },
    cityId: "C1",
    country: "DE",
    motisIds: ["motis_S1"],
  },
  S2: {
    name: "Stop2",
    geo: { latitude: 20, longitude: 20 },
    cityId: "C2",
    country: "DE",
    motisIds: ["motis_S2"],
  },
  S3: {
    name: "Stop3",
    geo: { latitude: 30, longitude: 30 },
    cityId: "C3",
    country: "DE",
    motisIds: ["motis_S3"],
  },
};

function initMocks() {
  const callbacks = { calendar: {}, datepicker: {}, map: {}, perlschnur: {} };

  const components = {
    mainContainer: { classList: { add: jest.fn(), remove: jest.fn() } },
    calendar: {
      on: (name, fn) => (callbacks.calendar[name] = fn),
      updateView: jest.fn(),
    },
    datepicker: {
      currentDate: DAY1,
      on: (name, fn) => (callbacks.datepicker[name] = fn),
      updateView: jest.fn(), // todo no expects for this currently
    },
    map: {
      initMapData: jest.fn(),
      on: (name, fn) => (callbacks.map[name] = fn),
      updateView: jest.fn(),
    },
    perlschnur: {
      on: (name, fn) => (callbacks.perlschnur[name] = fn),
      updateView: jest.fn(),
    },
  };

  const geoDatabase = new GeoDatabase(testCities, testStops);
  const travelDatabase = {
    geoDatabase: geoDatabase,
    getAlternatives: jest.fn(),
    plan: jest.fn(),
    getCachedConnection: jest.fn(),
  };

  return [components, travelDatabase, callbacks];
}

test("main should initialize map and update all components with empty data", async function () {
  const [components, travelDatabase, callbacks] = initMocks();
  // @ts-expect-error TS2345
  await main("C1", components, travelDatabase);

  // initial map data
  expect(components.map.initMapData).toHaveBeenCalledWith([
    // cities
    {
      defaults: {
        C1: expect.any(Object),
        C2: expect.any(Object),
        C3: expect.any(Object),
      },
      geo: {
        C1: expect.any(Object),
        C2: expect.any(Object),
        C3: expect.any(Object),
      },
    },
    // edges
    {
      defaults: {
        "C1->C2": expect.any(Object),
        "C1->C3": expect.any(Object),
        "C2->C3": expect.any(Object),
      },
      geo: {
        "C1->C2": expect.any(Object),
        "C1->C3": expect.any(Object),
        "C2->C3": expect.any(Object),
      },
    },
  ]);

  // layout
  expect(components.mainContainer.classList.remove).not.toHaveBeenCalled();
  expect(components.mainContainer.classList.add).toHaveBeenCalledWith(
    "no-journey",
  );

  // empty component data
  expect(components.calendar.updateView).toHaveBeenCalledWith(DAY1, []);
  expect(components.map.updateView).toHaveBeenCalledWith({
    cities: {},
    edges: {},
    itineraries: {},
  });
  expect(components.perlschnur.updateView).toHaveBeenCalledWith({
    summary: {},
    transfers: [],
    connections: [],
  });
});

test("when user selects a destination, database should be queried for routes and components updated", async function () {
  // set everything up
  const [components, travelDatabase, callbacks] = initMocks();
  // @ts-expect-error TS2345
  await main("C1", components, travelDatabase);
  jest.clearAllMocks(); // reset after first call to updateComponents

  // there is just one route, directly from C1->C3
  travelDatabase.plan.mockReturnValueOnce([
    new Itinerary([_c("T1: S1@D1T10->S3@D1T11")]),
  ]);
  // same direct connection but on a different day
  travelDatabase.getAlternatives.mockReturnValueOnce([
    [_c("T2: S1@D2T10->S3@D2T11")],
  ]);

  // pretend user has clicked on the map
  await callbacks.map.showCityRoutes("C3");

  // layout was updated correctly
  expect(components.mainContainer.classList.add).not.toHaveBeenCalled();
  expect(components.mainContainer.classList.remove).toHaveBeenCalledWith(
    "no-journey",
  );

  // calendar was updated correctly
  expect(components.calendar.updateView).toHaveBeenCalledWith(DAY1, [
    expect.objectContaining({ name: "ICE T1", selected: true }),
    expect.objectContaining({ name: "ICE T2", selected: false }),
  ]);

  // map was updated correctly
  expect(components.map.updateView).toHaveBeenCalledWith({
    cities: { C1: expect.any(Object), C3: expect.any(Object) },
    edges: { "C1->C3": expect.any(Object) },
    itineraries: { "C1->C3": expect.any(Object) },
  });

  // perlschnur was updated correctly
  expect(components.perlschnur.updateView).toHaveBeenCalledWith({
    summary: expect.objectContaining({ from: "Stop1", to: "Stop3" }),
    transfers: [],
    connections: [expect.objectContaining({ name: "ICE T1" })],
  });
});

test("when user moves things around in the calendar, components should be updated", async function () {
  // set everything up
  const [components, travelDatabase, callbacks] = initMocks();
  // @ts-expect-error TS2345
  await main("C1", components, travelDatabase);

  const c1 = _c("T1: S1@D1T10->S3@D1T11");
  const c2 = _c("T2: S1@D2T10->S3@D2T11");

  // there is just one route, directly from C1->C3
  travelDatabase.plan.mockReturnValueOnce([new Itinerary([c1])]);
  // same direct connection but on a different day
  travelDatabase.getAlternatives.mockReturnValueOnce([[c2]]);

  // sets an active route
  await callbacks.map.showCityRoutes("C3");

  // now pretend that user has moved things around in the calendar
  jest.clearAllMocks();
  travelDatabase.getCachedConnection.mockReturnValueOnce(c2);
  travelDatabase.getAlternatives.mockReturnValueOnce([[c1]]);
  await callbacks.calendar.legChanged("C1->C3", c2.id);

  // calendar now shows T2 as active
  expect(components.calendar.updateView).toHaveBeenCalledWith(DAY1, [
    // todo they are coming in the wrong order
    expect.objectContaining({ name: "ICE T2", selected: true }),
    expect.objectContaining({ name: "ICE T1", selected: false }),
  ]);

  // map data is unchanged
  expect(components.map.updateView).toHaveBeenCalledWith({
    cities: { C1: expect.any(Object), C3: expect.any(Object) },
    edges: { "C1->C3": expect.any(Object) },
    itineraries: { "C1->C3": expect.any(Object) },
  });

  // perlschnur now shows T2
  expect(components.perlschnur.updateView).toHaveBeenCalledWith({
    summary: expect.objectContaining({ from: "Stop1", to: "Stop3" }),
    transfers: [],
    connections: [expect.objectContaining({ name: "ICE T2" })],
  });
});

test("when user picks a different journey as active, components should be updated", async function () {
  // set everything up
  const [components, travelDatabase, callbacks] = initMocks();
  // @ts-expect-error TS2345
  await main("C1", components, travelDatabase);

  const itineraries = {
    direct: new Itinerary([_c("T1: S1@D1T10->S3@D1T11")]),
    via: new Itinerary([
      _c("T2: S1@D1T10->S2@D1T11"),
      _c("T3: S2@D1T13->S3@D1T14"),
    ]),
  };

  const alternatives = {
    direct: [[_c("T4: S1@D2T10->S2@D2T11")]],
    via: [[], []], // no alternatives for simplicity
  };

  // there are two routes, first direct, other via a different station
  // the first one will get picked as active itinerary automatically
  travelDatabase.plan.mockReturnValueOnce([
    itineraries.direct,
    itineraries.via,
  ]);
  // alternatives for first (active) itinerary on different day
  travelDatabase.getAlternatives.mockReturnValueOnce(alternatives.direct);

  // pretend user has clicked on the map, this runs fake trip planning and sets
  // first itinerary as active
  await callbacks.map.showCityRoutes("C2");
  jest.clearAllMocks();

  // will now set other itinerary as active -> need to set up alternatives
  travelDatabase.getAlternatives.mockReturnValueOnce(alternatives.via);

  // pretend user has set other itinerary as active
  await callbacks.map.selectJourney(itineraries.via.id);

  // calendar now shows connections for second itinerary
  expect(components.calendar.updateView).toHaveBeenCalledWith(DAY1, [
    expect.objectContaining({ name: "ICE T2", selected: true }),
    expect.objectContaining({ name: "ICE T3", selected: true }),
  ]);

  // map still shows both itineraries, but the edges for the second one are active now
  expect(components.map.updateView).toHaveBeenCalledWith({
    cities: {
      C1: expect.objectContaining({ isVisible: true }),
      C2: expect.objectContaining({ isVisible: true }),
      C3: expect.objectContaining({ isVisible: true }),
    },
    edges: {
      "C1->C2": expect.objectContaining({ isActive: true }),
      "C2->C3": expect.objectContaining({ isActive: true }),
      "C1->C3": expect.objectContaining({ isActive: false }),
    },
    itineraries: {
      "C1->C2->C3": expect.any(Object),
      "C1->C3": expect.any(Object),
    },
  });

  // perlschnur now shows the second itinerary
  expect(components.perlschnur.updateView).toHaveBeenCalledWith({
    summary: expect.objectContaining({ from: "Stop1", to: "Stop3" }),
    transfers: [expect.objectContaining({ time: "2h 1min" })],
    connections: [
      expect.objectContaining({ name: "ICE T2" }),
      expect.objectContaining({ name: "ICE T3" }),
    ],
  });
});
