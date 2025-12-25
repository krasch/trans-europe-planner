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
 * @property {boolean} isActive
 *
 * @param {Connection} connection
 * @param {string} color
 * @param {boolean} isActive
 * @returns {CalendarEvent}
 */
function dataForConnection(connection, color, isActive) {
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
    isActive: isActive,
  };
}

/**
 * @param {Itinerary} activeItinerary
 * @param {Connection[][]} alternatives
 * @returns {CalendarEvent[]}
 */
export function prepareDataForCalendar(activeItinerary, alternatives) {
  // active itinerary: list of connections
  // alternatives: array of same length, each entry list of alternatives for the respect connection

  if (!activeItinerary) return [];

  const data = [];
  activeItinerary.connections.forEach((connection, i) => {
    // this will add an event for the currently selected connection to the calendar
    data.push(dataForConnection(connection, getColor(i), true));

    // and also add one event for each alternative to this connection
    /*for (let alternative of alternatives[i]) {
      if (alternative.id === connection.id) continue;
      data.push(dataForConnection(alternative, getColor(i), false));
    }*/
  });

  return data;
}
