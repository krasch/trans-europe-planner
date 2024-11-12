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

async function main(
  map,
  calendar,
  journeySelection,
  startDestinationSelection,
) {
  const DATES = ["2024-10-16", "2024-10-17", "2024-10-18"];

  // prepare database
  const connections = CONNECTIONS.flatMap((c) =>
    enrichAndTemporalizeConnection(c, STATIONS, CITIES, DATES),
  );
  const database = new Database(connections);

  // initial drawing of all necessary geo information
  const mapLoadedPromise = map.load(CITIES, connections);

  // init update views
  const updateViews = initUpdateViews(
    map,
    calendar,
    journeySelection,
    database,
  );

  // init state
  let journeys = {};
  let active = null;

  // changing start/destination
  startDestinationSelection.on("startOrDestinationChanged", (target) => {
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
  map.on("legAdded", (leg) => {
    const connection = getConnectionForLeg(journeys[active], leg, database);
    journeys[active].setConnectionForLeg(leg, connection);
    updateViews(journeys, active);
  });
  map.on("legRemoved", (leg) => {
    journeys[active].removeLeg(leg);
    updateViews(journeys, active);
  });

  // moving things around in the calendar
  calendar.on("legChanged", (leg, connectionId) => {
    journeys[active].setConnectionForLeg(leg, connectionId);
    updateViews(journeys, active);
  });

  // selecting a different journey
  journeySelection.on("journeySelected", (journeyId) => {
    active = journeyId;
    updateViews(journeys, active);
  });

  // hovering over map or calender
  calendar.on("entryStartHover", (leg) => map.setHover(leg));
  calendar.on("entryStopHover", (leg) => map.setNoHover(leg));
  map.on("legStartHover", (leg) => calendar.setHover(leg));
  map.on("legStopHover", (leg) => calendar.setNoHover(leg));

  // now have done all we can do without having the map ready
  await mapLoadedPromise;

  // read the current start/destination values and fill all views
  startDestinationSelection.triggerChangeEvent();
}
