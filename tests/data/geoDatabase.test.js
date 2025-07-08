import { DataError, GeoDatabase } from "/script/data/geoDatabase.js";

function initDatabase(cityData, stopData) {
  const cities = {};
  const stops = {};

  for (let city of cityData) {
    cities[city.id] = {
      name: city.name,
      geo: { latitude: -city.coord, longitude: city.coord },
      isDestination: city.dest ?? undefined,
    };
  }
  for (let stop of stopData) {
    stops[stop.id] = {
      name: stop.name,
      geo: { latitude: -stop.coord, longitude: stop.coord },
      cityId: stop.city,
      country: stop.country ?? "DE",
      motisIds: stop.motis ?? [stop.id],
      secondary: stop.secondary ?? false,
    };
  }

  return new GeoDatabase(cities, stops);
}

test("City with no stop", function () {
  const c1 = { id: "c1", name: "City1", coord: 10 };

  expect(() => initDatabase([c1], [])).toThrow(DataError);
});

test("City with one stop", function () {
  const c1 = { id: "c1", name: "City1", coord: 10, dest: true };
  const s1 = { id: "s1", name: "Stop1", coord: 11, city: c1.id, motis: ["a"] };
  const db = initDatabase([c1], [s1]);

  expect(() => db.cityNameToId("XYZ")).toThrow(DataError);
  expect(() => db.motisStopIdForCityId("c4")).toThrow(DataError);
  expect(() => db.stopForMotisStopId("XYZ")).toThrow(DataError);
  expect(() => db.cityForStopId("XYZ")).toThrow(DataError);

  expect(db.cityNameToId("City1")).toBe("c1");
  expect(db.motisStopIdForCityId("c1")).toBe("a");
  expect(db.stopForMotisStopId("a")).toStrictEqual({ id: "s1", name: "Stop1" });
  expect(db.cityForStopId("s1")).toStrictEqual({ id: "c1", name: "City1" });
  expect(db.geoDataForAllCities).toStrictEqual([
    {
      id: c1.id,
      name: c1.name,
      lngLat: [c1.coord, -c1.coord],
      isDestination: true,
    },
  ]);
});

test("City with one main and one secondary stop", function () {
  const c1 = { id: "c1", name: "City1", coord: 10 };
  const s1 = { id: "s1", name: "Stop1", coord: 11, city: c1.id, motis: ["a"] };
  const s2 = { id: "s2", name: "Stop2", coord: 12, city: c1.id, motis: ["b"] };

  s1.secondary = true;
  s2.secondary = false;

  const db = initDatabase([c1], [s1, s2]);

  expect(db.motisStopIdForCityId("c1")).toBe("b");
  expect(db.stopForMotisStopId("a")).toStrictEqual({ id: "s1", name: "Stop1" });
  expect(db.stopForMotisStopId("b")).toStrictEqual({ id: "s2", name: "Stop2" });
});

test("City with no main stop", function () {
  const c1 = { id: "c1", name: "City1", coord: 10 };
  const s1 = { id: "s1", name: "Stop1", coord: 11, city: c1.id, motis: ["a"] };
  const s2 = { id: "s2", name: "Stop2", coord: 12, city: c1.id, motis: ["b"] };

  s1.secondary = true;
  s2.secondary = true;

  expect(() => initDatabase([c1], [])).toThrow(DataError);
});

test("City with multiple main stops", function () {
  const c1 = { id: "c1", name: "City1", coord: 10 };
  const s1 = { id: "s1", name: "Stop1", coord: 11, city: c1.id, motis: ["a"] };
  const s2 = { id: "s2", name: "Stop2", coord: 12, city: c1.id, motis: ["b"] };

  s1.secondary = false;
  s2.secondary = false;

  expect(() => initDatabase([c1], [])).toThrow(DataError);
});

test("Stop with multiple motis ids", function () {
  const c1 = { id: "c1", name: "City1", coord: 10 };
  const s1 = {
    id: "s1",
    name: "Stop1",
    coord: 11,
    city: c1.id,
    motis: ["a", "b", "c"],
  };

  const db = initDatabase([c1], [s1]);

  expect(db.motisStopIdForCityId("c1")).toBe("a");
  expect(db.stopForMotisStopId("a")).toStrictEqual({ id: "s1", name: "Stop1" });
  expect(db.stopForMotisStopId("b")).toStrictEqual({ id: "s1", name: "Stop1" });
  expect(db.stopForMotisStopId("c")).toStrictEqual({ id: "s1", name: "Stop1" });
});
