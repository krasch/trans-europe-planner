import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";

import { ICONS, getColor } from "./_common.js";

/**
 * @typedef {Object} PerlschnurStopData
 * @property {string} stopId
 * @property {string} stopName
 * @property {string} time
 * @property {string} date
 **/

/**
 * @typedef {Object} PerlschnurConnectionData
 * @property {string} id
 * @property {string} color
 * @property {string} name
 * @property {string} icon
 * @property {string} travelTime
 * @property {string} transferTime
 * @property {PerlschnurStopData[]} stops
 **/

/**
 * @param {DateTime} earlierTimestamp
 * @param {DateTime} laterTimestamp
 * @returns {String}
 */
export function formatTimedelta(earlierTimestamp, laterTimestamp) {
  const units = ["hours", "minutes"];
  const diff = laterTimestamp.diff(earlierTimestamp, units).toObject();

  let hoursString = "";
  if (diff.hours > 0) hoursString = `${diff.hours}h`;

  let minutesString = "";
  if (diff.minutes > 0) minutesString = `${diff.minutes}min`;

  const result = [hoursString, minutesString];
  return result.filter((e) => e.length > 0).join(" ");
}

/**
 * @param {DateTime} timestamp
 * @returns {String}
 */
function formateDate(timestamp) {
  return timestamp.toLocaleString({ month: "short", day: "2-digit" });
}

/**
 * @param {Itinerary} activeItinerary
 * @returns {PerlschnurConnectionData[]}
 */
export function prepareDataForPerlschnur(activeItinerary) {
  const result = [];

  // this variable will always capture the departure (if first stop in connection)
  // or arrival (all other stops) of the most recent stop, across connections
  let previousTimestamp = null;

  activeItinerary.connections.forEach((connection, connectionIdx) => {
    // figure out all the info for the stops in this connection
    const stops = connection.stops.map((stop, stopIdx) => {
      // first stop in connections uses departure, all others use arrival
      const timestamp = stopIdx === 0 ? stop.departure : stop.arrival;

      // we only need to write the date if it has changed wrt to the previous stop
      // this is done ACROSS connections, i.e. the first stop in connection2 will
      // get the date set if it differs from the last stop in connection1
      let date = formateDate(timestamp);
      if (previousTimestamp && date === formateDate(previousTimestamp))
        date = null;

      // set as reference for next stop
      previousTimestamp = timestamp;

      return {
        stopId: stop.stopId,
        stopName: stop.stopName,
        time: timestamp.toFormat("HH:mm"),
        date: date ? `(${date})` : "",
      };
    });

    let transferTime = null;
    if (connectionIdx < activeItinerary.connections.length - 1) {
      const next = activeItinerary.connections[connectionIdx + 1];
      transferTime = formatTimedelta(
        connection.to.arrival,
        next.from.departure,
      );
    }

    // combine with all the rest of the connection info
    result.push({
      id: connection.id,
      color: getColor(connectionIdx),
      name: connection.name,
      icon: ICONS[connection.mode],
      travelTime: formatTimedelta(
        connection.from.departure,
        connection.to.arrival,
      ),
      stops: stops,
      transferTime: transferTime,
    });
  });

  return result;
}
