import { DateTime } from "app/types/dateTime.js";
import { Itinerary } from "app/types/itinerary.js";

import { ConnectionId } from "./types/connection.js";

export const DEFAULTS = {
  zoom: 7.3,
  center: [11.75685, 54.0443],
};

/**
 * @typedef {Object} ParsedURLData
 * @property {string} [from]
 * @property {string} [to]
 * @property {DateTime} [date]
 * @property {ConnectionId[]} [connectionIds]
 * @property {Number} [zoom]
 * @property {Number[]} [center]
 */

/**
 * @param {String} searchParamString
 * @returns {ParsedURLData}
 */
export function parseURLParams(searchParamString) {
  //const searchParams = new URLSearchParams(window.location.search);
  const searchParams = new URLSearchParams(searchParamString);

  const connectionIds = [];

  // todo deal with malformed trip info
  searchParams.getAll("trip-id").forEach((id, i) => {
    connectionIds.push(
      new ConnectionId(
        id,
        searchParams.getAll("trip-from")[i],
        searchParams.getAll("trip-to")[i],
        DateTime.fromISO(searchParams.getAll("trip-date")[i]),
      ),
    );
  });

  let date = DateTime.fromISO(searchParams.get("date"));
  if (!date.isValid) date = null;

  return {
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    date: date,
    connectionIds: connectionIds,
    zoom: DEFAULTS.zoom,
    center: DEFAULTS.center,
  };
}

/**
 * @returns {ParsedURLData}
 */
export function getURLState() {
  return parseURLParams(window.location.search);
}

/**
 * @param {String} [from]
 * @param {String} [to]
 * @param {DateTime} [date]
 * @param {ConnectionId[]} [activeItinerary]
 */
export function fillURLParams(from, to, date, activeItinerary) {
  const searchParams = new URLSearchParams();

  if (from) searchParams.set("from", from);
  if (to) searchParams.set("to", to);
  if (date) searchParams.set("date", date.toISODate());

  if (activeItinerary) {
    for (let connectionId of activeItinerary) {
      searchParams.append("trip-id", connectionId.tripId);
      searchParams.append("trip-from", connectionId.fromStopId);
      searchParams.append("trip-to", connectionId.toStopId);
      searchParams.append("trip-date", connectionId.date.toISODate());
    }
  }

  return searchParams;
}

/**
 * @param {String} from
 * @param {String} to
 * @param {DateTime} date
 * @param {ConnectionId[]} [activeItinerary]
 */
export function setURLState(from, to, date, activeItinerary) {
  const url = new URL(window.location.href);
  url.search = fillURLParams(from, to, date, activeItinerary).toString();

  window.history.pushState(null, "", url.toString());
  window.dispatchEvent(new Event("pushstate"));
}

export class URLObserver {
  #callbacks = {
    urlChanged: () => {},
  };

  constructor() {
    window.addEventListener("pushstate", (e) => {
      this.#callbacks["urlChanged"]();
    });
    window.addEventListener("popstate", (e) => {
      this.#callbacks["urlChanged"]();
    });
  }

  on(eventName, eventCallback) {
    this.#callbacks[eventName] = eventCallback;
  }
}
