class CreatingItineraryNotPossible extends Error {
  constructor(message) {
    super(message);
    this.name = "CreatingItineraryNotPossible";
  }
}

function getFirstMatchingConnection(connections, startDateTime) {
  const leg = connections[0].leg;

  //sort by departure
  connections = Object.values(connections);
  connections = connections.sort((c1, c2) =>
    c1.stops[0].departure.compareTo(c2.stops[0].departure),
  );

  // filter by departure
  if (startDateTime)
    connections = connections.filter(
      (c) => c.stops[0].departure.valueOf() >= startDateTime.valueOf(),
    );

  if (connections.length === 0) throw new CreatingItineraryNotPossible(leg);

  return connections[0];
}

function createItineraryForRoute(legs, startDateTime, database) {
  const itinerary = [];

  for (const leg of legs) {
    const connections = Object.values(database.connectionsForLeg(leg));

    const match = getFirstMatchingConnection(connections, startDateTime);
    itinerary.push(match.id);

    startDateTime = match.stops.at(-1).arrival; // todo Umstiegszeit
  }

  return itinerary;
}

// todo mode = space-before, space-between, etc
// todo don't try to start before 8 on all travel dates

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.createItineraryForRoute = createItineraryForRoute;
  module.exports.CreatingItineraryNotPossible = CreatingItineraryNotPossible;
}
