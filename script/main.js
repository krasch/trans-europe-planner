function initUpdateViews(map, calendar, database) {
  function updateViews(state) {
    map.updateView(prepareDataForMap(state, database));
    calendar.updateView(prepareDataForCalendar(state, database));
  }
  return updateViews;
}

async function main(map, calendar, startDestinationSelection) {
  const DATES = ["2024-12-01", "2024-12-02", "2024-12-03"];

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
  const journeys = new JourneyCollection();

  // changing start/destination
  startDestinationSelection.on("startOrDestinationChanged", (target) => {
    journeys.reset();

    if (target === null) {
      calendar.hide();
    } else {
      calendar.show();
      for (let route of ROUTES[target]) {
        const connectionIds = createStupidItineraryForRoute(route, database);
        journeys.addJourney(connectionIds);
      }
      journeys.setActive(0); // todo?
    }

    updateViews(journeys);
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
  calendar.on("legChanged", (connectionId) => {
    journeys.activeJourney.updateLeg(connectionId);
    updateViews(journeys);
  });

  // selecting a different journey
  map.on("alternativeJourneyClicked", (journeyId) => {
    journeys.setActive(journeyId);
    updateViews(journeys);
  });

  // clicking on a city
  map.on("cityHoverStart", (city) => {
    const target = `Berlin->${city}`;
    if (!ROUTES[target]) return;

    for (let route of ROUTES[target]) {
      const connectionIds = createStupidItineraryForRoute(route, database);
      journeys.addJourney(connectionIds);
    }
    updateViews(journeys);
  });
  map.on("cityHoverEnd", (city) => {
    journeys.removeJourneysWithDestination(city);
    updateViews(journeys);
  });

  // hovering over map or calender
  calendar.on("entryHoverStart", (leg) => map.setHoverState("leg", leg, true));
  calendar.on("entryHoverStop", (leg) => map.setHoverState("leg", leg, false));
  //map.on("legHoverStart", (leg) => calendar.setHoverEntry(leg));
  //map.on("legHoverStop", (leg) => calendar.setNoHoverEntry(leg));

  // now have done all we can do without having the map ready
  await mapLoadedPromise;

  // read the current start/destination values and fill all views
  startDestinationSelection.triggerChangeEvent();
}
