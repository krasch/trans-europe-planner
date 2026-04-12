import { getIcon, getColor } from "app/components/assets.js";
import { DateTime } from "app/types/dateTime.js";
import { Itinerary } from "app/types/itinerary.js";

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
export function formatDate(timestamp) {
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
    const stops = connection.stops.map((stopTime, stopIdx) => {
      // first stop in connections uses departure, all others use arrival
      const timestamp = stopIdx === 0 ? stopTime.departure : stopTime.arrival;

      // we only need to write the date if it has changed wrt to the previous stop
      // this is done ACROSS connections, i.e. the first stop in connection2 will
      // get the date set if it differs from the last stop in connection1
      let date = formatDate(timestamp);
      if (previousTimestamp && date === formatDate(previousTimestamp))
        date = null;

      // set as reference for next stop
      previousTimestamp = timestamp;

      return {
        stopId: stopTime.stop.id,
        stopName: stopTime.stop.name,
        time: timestamp.toFormat("HH:mm"),
        date: date ? `(${date})` : "",
      };
    });

    // calculate time to next connection, null if this is the last connection
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
      id: connection.id.toString(),
      color: getColor(connectionIdx),
      name: connection.name,
      icon: getIcon(connection.mode),
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
