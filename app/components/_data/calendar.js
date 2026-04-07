import { getIcon, getColor } from "app/components/assets.js";
import { Connection } from "app/types/connection.js";
import { DateTime } from "app/types/dateTime.js";
import { Itinerary } from "app/types/itinerary.js";

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
 */

/**
 * @param {Connection} connection
 * @param {string} color
 * @param {('active'|'active-loading'|'inactive')} status
 * @returns {CalendarEvent}
 */
function dataForConnection(connection, color, status) {
  return {
    id: connection.id.toString(),
    leg: `${connection.from.stopId}->${connection.to.stopId}`,
    name: connection.name,
    icon: getIcon(connection.mode),
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
    const isLoaded = alternatives[i] !== null;
    const status = isLoaded ? "active" : "active-loading";

    // this will add an event for the currently selected connection to the calendar
    data.push(dataForConnection(connection, getColor(i), status));

    // alternatives for this connection haven't finished loading yet
    if (!isLoaded) return;

    // add one event for each alternative to this connection
    for (let alt of alternatives[i]) {
      data.push(dataForConnection(alt, getColor(i), "inactive"));
    }
  });

  return data;
}
