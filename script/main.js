function initUpdateViews(map, calendar, journeySelection, database) {
  function updateViews(journeys, active) {
    map.updateView(prepareDataForMap(journeys, active, database));
    calendar.updateView(prepareDataForCalendar(journeys, active, database));
    journeySelection.updateView(
      prepareDataForJourneySelection(journeys, active, database),
    );
  }
  return updateViews;
}

function getConnectionForLeg(journey, leg, database) {
  const connection = journey.previousConnection(leg);
  if (connection) return connection;

  return pickFittingConnection(journey.unsortedConnections, leg, database);
}

async function main(map, calendar, journeySelection) {
  // init database
  const connections = removeMultidayConnections(
    temporalizeConnections(CONNECTIONS), // todo dates here
  );
  const database = new Database(CITIES, STATIONS, connections, LEGS);

  // init state
  const target = "Berlin->Roma";
  const journeys = {
    journey1: createJourneyForRoute(ROUTES[target][0], database),
    journey2: createJourneyForRoute(ROUTES[target][1], database),
    journey3: createJourneyForRoute(ROUTES[target][2], database),
    //journey3: createJourneyForRoute([], database),
  };
  let active = "journey3";

  // now have done all we can do without having the map ready
  await map.load();

  // draw initial journey
  const updateViews = initUpdateViews(
    map,
    calendar,
    journeySelection,
    database,
  );
  updateViews(journeys, active);

  // hovering over map or calender
  calendar.on("entryStartHover", (leg) => map.setHover(leg));
  calendar.on("entryStopHover", (leg) => map.setNoHover(leg));
  map.on("legStartHover", (leg) => calendar.setHover(leg));
  map.on("legStopHover", (leg) => calendar.setNoHover(leg));

  //changing the journey
  map.on("legAdded", (leg) => {
    const connection = getConnectionForLeg(journeys[active], leg, database);
    journeys[active].setConnectionForLeg(leg, connection);
    updateViews(journeys, active);
  });
  map.on("legRemoved", (leg) => {
    journeys[active].removeLeg(leg);
    updateViews(journeys, active);
  });
  calendar.on("legChanged", (leg, connectionId) => {
    journeys[active].setConnectionForLeg(leg, connectionId);
    updateViews(journeys, active);
  });
  journeySelection.on("journeySelected", (journeyId) => {
    active = journeyId;
    updateViews(journeys, active);
  });
}
