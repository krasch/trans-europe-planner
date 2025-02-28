import { DateTime } from "/external/luxon@3.5.0/luxon.min.js";
import { Stop, Connection } from "/script/data/types/connection.js";
import { initCityNameToId } from "/script/util.js";

export const DAY1 = "2024-10-15";
export const DAY2 = "2024-10-16";
export const DAY3 = "2024-10-17";
export const DAY1T = (t) => `${DAY1}T${t}`;
export const DAY2T = (t) => `${DAY2}T${t}`;
export const DAY3T = (t) => `${DAY3}T${t}`;

export const CALENDAR_GRID = {
  ROW_MIDNIGHT: 2, // 1 for header, 1 because indexes start at 1
  COLUMN_FIRST_DAY: 2, // 1 for header, 1 because indexes start at 1
};

export const testCities = {
  cityId1: { name: "City1", geo: { latitude: 10, longitude: 10 }, rank: 1 },
  cityId2: { name: "City2", geo: { latitude: 20, longitude: 20 }, rank: 2 },
  cityId3: {
    name: "City3",
    geo: { latitude: 30, longitude: 30 },
    rank: 3,
    routesAvailable: true,
  },
  cityId4: { name: "City4", geo: { latitude: 40, longitude: 40 }, rank: 4 },
  cityId5: { name: "City5", geo: { latitude: 50, longitude: 50 }, rank: 5 },
};

export const testStations = {
  city1MainStationId: {
    name: "City 1 Main Station",
    city_id: "cityId1",
  },
  city1ExtraStationId: {
    name: "City 1 Extra Station",
    city_id: "cityId1",
    secondary: true,
  },
  city2MainStationId: {
    name: "City 2 Main Station",
    city_id: "cityId2",
  },
  city3MainStationId: {
    name: "City 3 Main Station",
    city_id: "cityId3",
  },
  city3ExtraStationId: {
    name: "City 3 Extra Station",
    city_id: "cityId3",
    secondary: true,
  },
  city4MainStationId: {
    name: "City 4 Main Station",
    city_id: "cityId4",
  },
  city5MainStationId: {
    name: "City 5 Main Station",
    city_id: "cityId5",
  },
};

function initIncrementalId() {
  let id = 0;

  function increment() {
    id += 1;
    return `c${id}`;
  }

  return increment;
}

export function connectionToCalendarEntry(connection, kwargs = {}) {
  const template = document.getElementById("template-calendar-connection");
  const e = template.content.firstElementChild.cloneNode(true);

  e.dataset.color = kwargs.color ?? "test-color";
  e.dataset.active = kwargs.active ?? "";

  e.dataset.group = `${connection.startCityName}->${connection.endCityName}`;
  e.dataset.departureDatetime = connection.departure.toISO();
  e.dataset.arrivalDatetime = connection.arrival.toISO();

  e.querySelector(".connection-icon").src = "train.svg";
  e.querySelector(".connection-number").innerHTML = connection.id;
  e.querySelector(".start .time").innerHTML =
    connection.departure.toFormat("HH:mm");
  e.querySelector(".start .station").innerHTML = connection.startCityName;
  e.querySelector(".destination .time").innerHTML =
    connection.arrival.toFormat("HH:mm");
  e.querySelector(".destination .station").innerHTML = connection.endCityName;

  return e;
}

const incrementalId = initIncrementalId();

export function createConnection(stops, id = null) {
  const train = id ?? incrementalId();

  const stopsEnriched = [];
  for (let [date, time, stationId] of stops) {
    stopsEnriched.push(
      new Stop(
        DateTime.fromISO(date + "T" + time),
        DateTime.fromISO(date + "T" + time),
        stationId,
        testStations[stationId].name,
        testStations[stationId].secondary,
        testStations[stationId].city_id,
        testCities[testStations[stationId].city_id].name,
      ),
    );
  }

  return new Connection(train, "test", "train", stopsEnriched);
}

initCityNameToId(testCities);
