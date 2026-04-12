import { Connection } from "app/types/connection.js";
import { DateTime } from "app/types/dateTime.js";
import { Itinerary } from "app/types/itinerary.js";
import { Stop, StopTime } from "app/types/stop.js";

/**
 * @param {Object} motisStop
 * @returns {StopTime}
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

  return new StopTime(
    new Stop(stopId, motisStop.name, motisStop.lat, motisStop.lon),
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

  let intermediate = [];
  if (motisLeg.intermediateStops)
    intermediate = motisLeg.intermediateStops.map(parseMotisStop);

  return new Connection(
    motisLeg.tripId,
    motisLeg.mode,
    motisLeg.displayName,
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
  // keep only rail modes, remove things like "walk", "bus"
  // if other mode is at the start -> our itinerary starts from first rail stop
  // if other mode is at the end -> our itinerary ends at the last rail stop
  // if other mode is in the middle -> must show warning in perlschnur
  const legs = motisItinerary.legs.filter((l) => l.mode !== "WALK");
  return new Itinerary(legs.map(parseMotisConnection));
}

/**
 * @param {object} motisGeocodingStopResult
 * @returns {Stop}
 */
export function parseMotisGeocodingStopResult(motisGeocodingStopResult) {
  return new Stop(
    motisGeocodingStopResult.id,
    motisGeocodingStopResult.name,
    motisGeocodingStopResult.lat,
    motisGeocodingStopResult.lon,
  );
}
