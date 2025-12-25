import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";

import { ICONS, getColor } from "./_common.js";

/**
 * @typedef {Object} CalendarEvent
 * @property {string} id
 * @property {string} leg
 * @property {string} name
 * @property {string} icon
 * @property {string} from
 * @property {DateTime} departure
 * @property {string} to
 * @property {DateTime} arrival
 * @property {string} color
 * @property {('active'|'active-loading'|'inactive')} status
 *
 * @param {Connection} connection
 * @param {string} color
 * @param {('active'|'active-loading'|'inactive')} status
 * @returns {CalendarEvent}
 */
function dataForConnection(connection, color, status) {
  return {
    id: connection.id,
    leg: `${connection.from.stopId}->${connection.to.stopId}`,
    name: connection.name,
    icon: ICONS[connection.mode],
    from: connection.from.stopName,
    departure: connection.from.departure,
    to: connection.to.stopName,
    arrival: connection.to.arrival,
    color: color,
    status: status,
  };
}

/**
 * @param {Itinerary} activeItinerary
 * @param {Object.<String,Connection[] | null>} alternatives
 * @returns {CalendarEvent[]}
 */
export function prepareDataForCalendar(activeItinerary, alternatives) {
  const data = [];

  activeItinerary.connections.forEach((connection, i) => {
    // alternatives already available for this connection?
    const isLoaded = alternatives[connection.id] !== null;
    const status = isLoaded ? "active" : "active-loading";

    // this will add an event for the currently selected connection to the calendar
    data.push(dataForConnection(connection, getColor(i), status));

    // alternatives for this connection haven't finished loading yet
    if (alternatives[connection.id] === null) return;

    // add one event for each alternative to this connection
    for (let alt of alternatives[connection.id]) {
      data.push(dataForConnection(alt, getColor(i), "inactive"));
    }
  });

  return data;
}
