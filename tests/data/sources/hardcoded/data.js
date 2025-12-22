import { test, expect } from "vitest";

import { GeoDatabase } from "script/data/geoDatabase.js";

const CITIES = {
  C1: { name: "City1", geo: { latitude: 10, longitude: 10 } },
  C2: { name: "City2", geo: { latitude: 20, longitude: 20 } },
  C3: { name: "City3", geo: { latitude: 30, longitude: 30 } },
  C4: { name: "City4", geo: { latitude: 40, longitude: 40 } },
  C5: { name: "City5", geo: { latitude: 50, longitude: 50 } },
};

const STOPS = {
  S1: { name: "Stop1", geo: { latitude: 10, longitude: 10 }, cityId: "C1" },
  S2: { name: "Stop2", geo: { latitude: 20, longitude: 20 }, cityId: "C2" },
  S3: { name: "Stop3", geo: { latitude: 30, longitude: 30 }, cityId: "C3" },
  S4: { name: "Stop4", geo: { latitude: 40, longitude: 40 }, cityId: "C4" },
  S5A: { name: "Stop5A", geo: { latitude: 50, longitude: 50 }, cityId: "C5" },
  S5B: {
    name: "Stop5B",
    geo: { latitude: 50, longitude: 50 },
    cityId: "C5",
    secondary: true,
  },
  S5C: {
    name: "Stop5C",
    geo: { latitude: 50, longitude: 50 },
    cityId: "C5",
    secondary: true,
  },
};

// testing with the real data to make sure it is formatted as expected todo
const FILES = {
  cities: "data/europe_hardcoded/cities.json",
  stops: "data/europe_hardcoded/stops.json",
  connections: "data/europe_hardcoded/connections.json",
  routes: "data/europe_hardcoded/routes.json",
};

export function initGeoDatabase() {
  return new GeoDatabase(CITIES, STOPS);
}

/**
 * Make sure to align with connectionDataFromShorthand!
 * Not moving this over to the general data.js because this is only necessary
 * for these few hardcoded data tests
 * @param {string} shorthand
 * @returns Connection
 */
export function hardcodedConnectionDataFromShorthand(shorthand) {
  // "T1: S1@T10->S2@T11->S3@T12"
  const [tripId, stopListString] = shorthand.split(": ");

  const stops = stopListString.split("->").map((s) => {
    const [id, tsShorthand] = s.split("@");
    const hours = tsShorthand.slice(1); // remove the initial "T"

    const arrival = `${hours}:00`;
    const departure = `${hours}:01`;

    return { stopId: id, arrivalTime: arrival, departureTime: departure };
  });

  stops[0].arrivalTime = null;
  stops.at(-1).departureTime = null;

  const type = "train";
  const name = `ICE ${tripId}`;

  return {
    id: tripId,
    type: type,
    name: name,
    stops: stops,
  };
}
