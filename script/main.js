function initUpdateViews(map, calendar, database) {
  function updateViews(state) {
    map.updateView(prepareDataForMap(state.journeys, database));
    calendar.updateView(prepareDataForCalendar(state.journeys, database));
  }
  return updateViews;
}

async function main(home, map, calendar) {
  // init state
  const state = {
    journeys: new JourneyCollection(),
  };

  //addIsDestinationInfo(CITIES, ROUTES); // hack

  // prepare database
  const DATES = ["2024-12-01", "2024-12-02", "2024-12-03"];
  const connections = CONNECTIONS.flatMap((c) =>
    enrichAndTemporalizeConnection(c, STATIONS, CITIES, DATES),
  );
  const database = new Database(connections);

  // initial drawing of all necessary geo information
  const initialMapData = prepareInitialDataForMap(
    home,
    CITIES,
    connections,
    ROUTES,
  );
  const mapLoadedPromise = map.load(initialMapData);

  // init update views
  const updateViews = initUpdateViews(map, calendar, database);

  // moving things around in the calendar
  calendar.on("legChanged", (connectionId) => {
    state.journeys.activeJourney.updateLeg(connectionId);
    updateViews(state);
  });

  // selecting a different journey
  map.on("selectJourney", (journeyId) => {
    state.journeys.setActive(journeyId);
    updateViews(state);
  });

  // clicking on a city
  map.on("showCityRoutes", (cityName) => {
    const target = `${home}->${cityName}`;
    if (!ROUTES[target]) return; // todo handle error

    state.journeys.reset();

    for (let route of ROUTES[target]) {
      if (typeof route === "string") continue; // inline "comments" in routes file
      const connectionIds = createStupidItineraryForRoute(route, database);
      state.journeys.addJourney(connectionIds);
    }

    state.journeys.setShortestAsActive();
    updateViews(state);
  });

  map.on("showCalendar", (journeyId) => {
    calendar.show();
    document
      .getElementById("sidebar")
      .style.setProperty("visibility", "visible");
  });

  // hovering over map or calender
  calendar.on("entryHoverStart", (leg) => map.setLegHoverState(leg, true));
  calendar.on("entryHoverStop", (leg) => map.setLegHoverState(leg, false));

  // now have done all we can do without having the map ready
  await mapLoadedPromise;

  updateViews(state);
}
