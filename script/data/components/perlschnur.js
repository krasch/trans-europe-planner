import { getColor, identifiers, ICONS } from "./_common.js";

// todo localization
// todo error if order wrong?
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

function itinerarySummary(itinerary) {
  const from = itinerary.connections[0].from;
  const to = itinerary.connections.at(-1).to;
  const via = itinerary.vias.map((v) => v.stopName);

  return {
    from: from.stopName,
    to: to.stopName,
    totalTime: formatTimedelta(from.departure, to.arrival),
    via: via.length > 0 ? "via " + via.join(", ") : "",
  };
}

export function prepareDataForPerlschnur(activeItinerary) {
  const result = {
    summary: {},
    transfers: [],
    connections: [],
  };

  if (!activeItinerary) return result;

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
      let date = null;
      if (previousTimestamp) {
        if (previousTimestamp.startOf("day") < timestamp.startOf("day"))
          date = `(${timestamp.toFormat("d LLL")})`;
      }

      // set as reference for next stop
      previousTimestamp = timestamp;

      return {
        station: stop.stopName,
        time: timestamp.toFormat("HH:mm"),
        date: date,
      };
    });

    // combine with all the rest of the connection info
    result.connections.push({
      id: identifiers.connection(connection),
      color: getColor(connectionIdx),
      name: connection.name,
      icon: ICONS[connection.mode],
      travelTime: formatTimedelta(
        connection.from.departure,
        connection.to.arrival,
      ),
      stops: stops,
    });

    // and for all connections except the first, add transfer info
    if (connectionIdx > 0) {
      const previous = activeItinerary.connections[connectionIdx - 1];
      result.transfers.push({
        time: formatTimedelta(previous.to.arrival, connection.from.departure),
      });
    }
  });

  result.summary = itinerarySummary(activeItinerary);
  return result;
}
