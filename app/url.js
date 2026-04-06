import { ConnectionId } from "app/types/connection.js";
import { DateTime } from "app/types/dateTime.js";

/**
 * @typedef {Object} ParsedURLData
 * @property {string} [from]
 * @property {string} [to]
 * @property {DateTime} [date]
 * @property {ConnectionId[]} [active]
 * @property {ConnectionId[][]} [alternatives]
 * @property {Number} [zoom]
 * @property {Number[]} [center]
 */

export const DEFAULTS = {
  zoom: 7.3,
  center: [11.75685, 54.0443],
};

/**
 * @param {URLSearchParams} searchParams
 * @param {ConnectionId[]} connectionIds
 * @param {String} [prefix]
 */
function itineraryToParams(searchParams, connectionIds, prefix) {
  if (!prefix) prefix = "";

  connectionIds.forEach((connectionId) => {
    searchParams.append(`${prefix}trip-id`, connectionId.tripId);
    searchParams.append(`${prefix}trip-from`, connectionId.fromStopId);
    searchParams.append(`${prefix}trip-to`, connectionId.toStopId);
    searchParams.append(`${prefix}trip-date`, connectionId.date.toISODate());
  });
}

/**
 * @param {URLSearchParams} searchParams
 * @param {String} [prefix]
 * @returns {ConnectionId[]}
 */
function paramsToItinerary(searchParams, prefix) {
  if (!prefix) prefix = "";

  return searchParams
    .getAll(`${prefix}trip-id`)
    .map(
      (tripId, i) =>
        new ConnectionId(
          tripId,
          searchParams.getAll(`${prefix}trip-from`)[i],
          searchParams.getAll(`${prefix}trip-to`)[i],
          DateTime.fromISO(searchParams.getAll(`${prefix}trip-date`)[i]),
        ),
    );
}

/**
 * @param {String} searchParamString
 * @returns {ParsedURLData}
 */
export function parseURLParams(searchParamString) {
  const searchParams = new URLSearchParams(searchParamString);

  const active = paramsToItinerary(searchParams);

  // todo find saner URL schema
  const prefixes = ["alt1-", "alt2-", "alt3-", "alt4-", "alt5-"];
  const alternatives = prefixes
    .map((prefix) => paramsToItinerary(searchParams, prefix))
    .filter((alt) => alt.length > 0);

  let date = DateTime.fromISO(searchParams.get("date"));
  if (!date.isValid) date = null;

  return {
    from: searchParams.get("from"),
    to: searchParams.get("to"),
    date: date,
    active: active,
    alternatives: alternatives,
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
 * @param {ConnectionId[][]} [alternativeItineraries]
 */
export function fillURLParams(
  from,
  to,
  date,
  activeItinerary,
  alternativeItineraries,
) {
  const searchParams = new URLSearchParams();

  if (from) searchParams.set("from", from);
  if (to) searchParams.set("to", to);
  if (date) searchParams.set("date", date.toISODate());

  if (activeItinerary) itineraryToParams(searchParams, activeItinerary);

  if (alternativeItineraries) {
    alternativeItineraries.forEach((alternative, i) =>
      itineraryToParams(searchParams, alternative, `alt${i + 1}-`),
    );
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
