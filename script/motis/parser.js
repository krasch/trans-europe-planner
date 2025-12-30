import { Connection } from "script/types/connection.js";
import { DateTime } from "script/types/dateTime.js";
import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

/**
 * @param {Object} motisStop
 * @returns {Stop}
 */
function parseMotisStop(motisStop) {
  let stopId = motisStop.stopId;
  if (motisStop.parentId) stopId = motisStop.parentId;

  let arrival = null;
  if (motisStop.scheduledArrival)
    arrival = DateTime.fromISO(motisStop.scheduledArrival);

  let departure = null;
  if (motisStop.scheduledDeparture)
    departure = DateTime.fromISO(motisStop.scheduledDeparture);

  return new Stop(
    stopId,
    motisStop.name,
    motisStop.lat,
    motisStop.lon,
    arrival,
    departure,
  );
}

/**
 * @param {Object} motisLeg
 * @returns {Connection}
 */
function parseMotisConnection(motisLeg) {
  const from = parseMotisStop(motisLeg.from);
  const to = parseMotisStop(motisLeg.to);
  const intermediate = motisLeg.intermediateStops.map(parseMotisStop);

  return new Connection(
    motisLeg.tripId,
    motisLeg.mode,
    motisLeg.routeShortName,
    from,
    to,
    intermediate,
  );
}

/**
 * @param {Object} motisItinerary
 * @returns {Itinerary}
 */
export function parseMotisItinerary(motisItinerary) {
  // remove walk legs
  const legs = motisItinerary.legs.filter((l) => l.mode !== "WALK");
  return new Itinerary(legs.map(parseMotisConnection));
}
