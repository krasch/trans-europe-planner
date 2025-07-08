import { getColor, identifiers, ICONS } from "./_common.js";

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

export function prepareDataForCalendar(activeItinerary, alternatives) {
  // active itinerary: list of connections
  // alternatives: array of same length, each entry list of alternatives for the respect connection

  if (!activeItinerary) return [];

  const data = [];
  for (let i in activeItinerary.connections) {
    const connection = activeItinerary.connections[i];

    // this will add an event for the currently selected connection to the calendar
    data.push(dataForConnection(connection, getColor(i), true));

    // and also add one event for each alternative to this connection
    for (let alternative of alternatives[i]) {
      if (alternative.id === connection.id) continue;
      data.push(dataForConnection(alternative, getColor(i), false));
    }
  }

  return data;
}
