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
  // keep only rail modes, remove things like "walk", "bus"
  // if other mode is at the start -> our itinerary starts from first rail stop
  // if other mode is at the end -> our itinerary ends at the last rail stop
  // if other mode is in the middle -> must show warning in perlschnur
  const legs = motisItinerary.legs.filter((l) => l.mode !== "WALK");
  return new Itinerary(legs.map(parseMotisConnection));
}

export class GeocodedLocation {
  /**
   * @param {'stop' | 'place'} kind
   * @param {String} name
   * @param {String | null} id
   * @param {Number} latitude
   * @param {Number} longitude
   */
  constructor(kind, name, id = null, latitude, longitude) {
    this.kind = kind;
    this.name = name;
    this.id = id;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

/**
 * @param {object} motisGeocodingStopResult
 * @returns {{stop: GeocodedLocation, place: GeocodedLocation | null}}
 */
export function parseMotisGeocodingStopResult(motisGeocodingStopResult) {
  const areas = motisGeocodingStopResult.areas.filter((a) => a.default);

  let place = null;
  if (areas.length > 0)
    place = new GeocodedLocation(
      "place",
      areas[0].name,
      null, // id
      // todo areas here does not give its own lat/lon, bad to use stops?
      motisGeocodingStopResult.lat,
      motisGeocodingStopResult.lon,
    );

  const stop = new GeocodedLocation(
    "stop",
    motisGeocodingStopResult.name,
    motisGeocodingStopResult.id,
    motisGeocodingStopResult.lat,
    motisGeocodingStopResult.lon,
  );

  return { stop: stop, place: place };
}
