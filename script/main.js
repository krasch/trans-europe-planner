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

    if (target !== null) {
      for (let route of ROUTES[target]) {
        journeys.addJourney(createJourneyForRoute(route, database));
      }
      journeys.setActive(0); // todo?
    }

    updateViews(journeys);

    if (target == null) {
      document
        .getElementById("calender-details")
        .style.setProperty("visibility", "hidden");
    } else {
      document
        .getElementById("calender-details")
        .style.setProperty("visibility", "visible");
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
    journeys.activeJourney.setConnectionForLeg(leg, connectionId);
    updateViews(journeys);
  });

  // selecting a different journey
  map.on("journeySelected", (journeyId) => {
    journeys.setActive(journeyId);
    updateViews(journeys);
  });

  // hovering over map or calender
  calendar.on("entryHoverStart", (leg) => map.setHoverLeg(leg));
  calendar.on("entryHoverStop", (leg) => map.setNoHoverLeg(leg));
  //map.on("legHoverStart", (leg) => calendar.setHoverEntry(leg));
  //map.on("legHoverStop", (leg) => calendar.setNoHoverEntry(leg));

  // now have done all we can do without having the map ready
  await mapLoadedPromise;

  // read the current start/destination values and fill all views
  startDestinationSelection.triggerChangeEvent();
}
