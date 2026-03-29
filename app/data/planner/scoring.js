import { DateTime } from "app/types/dateTime.js";
import { Itinerary } from "app/types/itinerary.js";

/**
 *
 * @param {DateTime} datetime
 * @returns {Number}
 */
function minutesSinceMidnight(datetime) {
  return datetime.hour * 60 + datetime.minute;
}

/**
 *
 * @param {DateTime} earlier
 * @param {DateTime} later
 * @returns {Number}
 */
function diffDays(earlier, later) {
  const earlierMidnight = earlier.startOf("day");
  const laterMidnight = later.startOf("day");
  return laterMidnight.diff(earlierMidnight, "days").as("days");
}

/**
 * @param {Itinerary} itinerary
 * @param {DateTime} fromDate
 * @returns {Number}
 */
export function itineraryScore(itinerary, fromDate) {
  const days = diffDays(fromDate, itinerary.to.arrival);

  const departureMinutes = itinerary.connections.map((c) =>
    minutesSinceMidnight(c.from.departure),
  );
  const arrivalMinutes = itinerary.connections.map((c) =>
    minutesSinceMidnight(c.to.arrival),
  );

  const earliestDeparture = Math.min(...departureMinutes);
  const latestArrival = Math.max(...arrivalMinutes);

  const minutesBefore8 = Math.max(0, 8 * 60 - earliestDeparture);
  const minutesAfter22 = Math.max(0, latestArrival - 22 * 60);

  return -1000 * days - minutesBefore8 - minutesAfter22;
}

/**
 * @param {Itinerary[]} group
 * @param {Itinerary[][]} otherGroups
 * @returns boolean
 */
export function isParetoOptimal(group, otherGroups) {
  for (let other of otherGroups) {
    const otherRunsMoreOften = other.length > group.length;
    const otherHasFewerTransfers = other[0].vias.length < group[0].vias.length;
    if (otherRunsMoreOften && otherHasFewerTransfers) return false;
  }
  return true;
}
