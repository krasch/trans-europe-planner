import { DateTime } from "/external/luxon@3.5.0/luxon.min.js";
import { Stop, Connection, SlicingError } from "./types/connection.js";

export class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "BadDatabaseQuery";
  }
}

// workaround because can not import SlicingError because of way tests are set up
function isSlicingError(error) {
  return error.constructor.name === "SlicingError";
}

export function enrichConnection(template, stations, cities, dummyDate) {
  dummyDate = DateTime.fromISO(dummyDate);

  const stops = [];
  for (let stop of template.stops) {
    let arrivalTime = stop.arrival_time;
    let departureTime = stop.departure_time;

    // todo should not be necessary
    if (!arrivalTime) arrivalTime = departureTime;
    if (!departureTime) departureTime = arrivalTime;

    const arrivalOffset = stop.arrival_date_offset ?? 0;
    const departureOffset = stop.departure_date_offset ?? 0;

    const arrivalDate = dummyDate.plus({ days: arrivalOffset });
    const departureDate = dummyDate.plus({ days: departureOffset });

    stops.push(
      new Stop(
        DateTime.fromISO(arrivalDate.toISODate() + "T" + arrivalTime),
        DateTime.fromISO(departureDate.toISODate() + "T" + departureTime),
        // enrich with additional station and city info
        stop.station_id,
        stations[stop.station_id].name,
        stations[stop.station_id].secondary,
        stations[stop.station_id].city_id,
        cities[stations[stop.station_id].city_id].name,
      ),
    );
  }

  return new Connection(template.id, template.name, template.type, stops);
}

export class Database {
  // these templates use a dummy date and have the full run of all stops
  // {id: Connection}
  #templates;

  // the sliced templates are for a specific leg but still use a dummy date
  // {[id, startCity, endCity]: Connection}
  #sliced = {};

  // and here will be sliced, dated connections
  // {[id, startCity, endCity, date]: Connection}
  #connections = {};

  constructor(templates) {
    this.#templates = {};
    for (let t of templates) this.#templates[t.id] = t;
  }

  connection(id, startCityName, endCityName, date) {
    const dateString = date.toISODate();
    const compositeId = [id, startCityName, endCityName, dateString].join("XX");

    if (!this.#connections[compositeId]) {
      const sliced = this.#getSliced(id, startCityName, endCityName);
      this.#connections[compositeId] = sliced.changeDate(date);
    }

    return this.#connections[compositeId];
  }

  connectionsForLeg(startCityName, endCityName, dates) {
    const result = [];

    for (let id in this.#templates) {
      for (let date of dates) {
        try {
          result.push(this.connection(id, startCityName, endCityName, date));
        } catch (error) {
          // this connection does not have this leg, no need to try the other dates
          if (error instanceof SlicingError) break;
          // all other errors should bubble up
          throw error;
        }
      }
    }

    return result;
  }

  #getTemplate(id) {
    if (!this.#templates[id])
      throw new DatabaseError(`Unknown connection ${id}`);
    return this.#templates[id];
  }

  #getSliced(id, startCityName, endCityName) {
    const compositeId = `${id}XX${startCityName}XX${endCityName}`;

    if (!this.#sliced[compositeId]) {
      const template = this.#getTemplate(id);

      // can throw slicing error
      // todo calling this even if I already know from previous attempts that the slice does not exist
      this.#sliced[compositeId] = template.slice(startCityName, endCityName);
    }

    return this.#sliced[compositeId];
  }
}
