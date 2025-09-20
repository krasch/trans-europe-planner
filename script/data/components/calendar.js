import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";

import { ICONS, getColor, identifiers } from "./_common.js";

/**
 * @typedef {Object} CalendarEvent
 * @property {string} uniqueId
 * @property {string} leg
 * @property {string} name
 * @property {string} icon
 * @property {string} startStation
 * @property {DateTime} startDateTime
 * @property {string} endStation
 * @property {DateTime} endDateTime
 * @property {string} color
 * @property {boolean} selected
 *
 * @param {Connection} connection
 * @param {string} color
 * @param {boolean} isSelected
 * @returns {CalendarEvent}
 */
function dataForConnection(connection, color, isSelected) {
  return {
    uniqueId: identifiers.connection(connection),
    leg: identifiers.leg(connection),
    name: connection.name,
    icon: ICONS[connection.mode],
    startStation: connection.from.stopName,
    startDateTime: connection.from.departure,
    endStation: connection.to.stopName,
    endDateTime: connection.to.arrival,
    color: color,
    selected: isSelected,
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
    for (let alternative of alternatives[i]) {
      if (alternative.id === connection.id) continue;
      data.push(dataForConnection(alternative, getColor(i), false));
    }
  });

  return data;
}
