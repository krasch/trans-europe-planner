function initUpdateViews(map, calendar, database) {
  function updateViews(journeys, active) {
    map.updateView(prepareDataForMap(journeys, active, database));
    calendar.updateView(prepareDataForCalendar(journeys, active, database));
  }
  return updateViews;
}

function getConnectionForLeg(journey, leg, database) {
  const connection = journey.previousConnection(leg);
  if (connection) return connection;

  return pickFittingConnection(journey.unsortedConnections, leg, database);
}

async function main(map, calendar, startDestination) {
  const DATES = ["2024-10-16", "2024-10-17", "2024-10-18"];

  // prepare database
  const connections = CONNECTIONS.flatMap((c) =>
    enrichAndTemporalizeConnection(c, STATIONS, CITIES, DATES),
  );
  const database = new Database(connections);

  // initial drawing of all necessary geo information
  const mapLoadedPromise = map.load(
    prepareInitialDataForMap(CITIES, connections),
  );

  // init update views
  const updateViews = initUpdateViews(map, calendar, database);

  // init state
  let journeys = {};
  let active = null;

  // changing start/destination
  startDestination.on("startOrDestinationChanged", (target) => {
    if (target == null) {
      journeys = {};
      active = null;
      updateViews(journeys, active);
    } else {
      journeys = createJourneysForRoute(ROUTES[target], database);
      active = "journey1";
      updateViews(journeys, active);
    }
  });

  // removing/adding a leg in map
  /*map.on("legAdded", (leg) => {
    const connection = getConnectionForLeg(journeys[active], leg, database);
    journeys[active].setConnectionForLeg(leg, connection);
    updateViews(journeys, active);
  });
  map.on("legRemoved", (leg) => {
    journeys[active].removeLeg(leg);
    updateViews(journeys, active);
  });*/

  // moving things around in the calendar
  calendar.on("legChanged", (leg, connectionId) => {
    journeys[active].setConnectionForLeg(leg, connectionId);
    updateViews(journeys, active);
  });

  // selecting a different journey
  map.on("journeySelected", (journeyId) => {
    active = journeyId;
    updateViews(journeys, active);
  });

  // hovering over map or calender
  calendar.on("entryHoverStart", (leg) => map.setHoverLeg(leg));
  calendar.on("entryHoverStop", (leg) => map.setNoHoverLeg(leg));
  //map.on("legHoverStart", (leg) => calendar.setHoverEntry(leg));
  //map.on("legHoverStop", (leg) => calendar.setNoHoverEntry(leg));

  // now have done all we can do without having the map ready
  await mapLoadedPromise;

  // read the current start/destination values and fill all views
  startDestination.triggerChangeEvent();
}
