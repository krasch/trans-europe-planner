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
  // init database
  const connections = removeMultidayConnections(
    temporalizeConnections(CONNECTIONS), // todo dates here
  );
  const database = new Database(CITIES, STATIONS, connections, LEGS);

  const mapLoadedPromise = map.load(CITIES, prepareLegs(CITIES, LEGS));

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
