import fs from "fs";

import { GeoDatabase } from "script/data/geoDatabase.js";

// testing with the real data to make sure it is formatted as expected
const DATA = {
  cities: "data/europe_hardcoded/cities.json",
  stops: "data/europe_hardcoded/stops.json",
  connections: "data/europe_hardcoded/connections.json",
  routes: "data/europe_hardcoded/routes.json",
};

function initGeoDatabase() {
  const cities = JSON.parse(fs.readFileSync(DATA.cities, "utf8"));
  const stops = JSON.parse(fs.readFileSync(DATA.stops, "utf8"));
  return new GeoDatabase(cities, stops);
}

test("Get direct connections from hardcoded database", async function () {
  const geoDatabase = initGeoDatabase();
});
