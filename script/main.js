function initUpdateViews(map, calendar, database) {
  function updateViews(state) {
    map.updateView(prepareDataForMap(state.journeys, database));
    calendar.updateView(prepareDataForCalendar(state.journeys, database));

    if (state.home && state.journeys.activeJourney) calendar.show();
    else calendar.hide();
  }
  return updateViews;
}

async function main(map, calendar) {
  // init state
  const params = new URLSearchParams(window.location.search);
  const state = {
    home: params.get("start"),
    journeys: new JourneyCollection(),
    temporaryNetwork: null, // todo better name
  };

  // prepare database
  const DATES = ["2024-12-01", "2024-12-02", "2024-12-03"];
  const connections = CONNECTIONS.flatMap((c) =>
    enrichAndTemporalizeConnection(c, STATIONS, CITIES, DATES),
  );
  const database = new Database(connections);

  // initial drawing of all necessary geo information
  const initialMapData = prepareInitialDataForMap(CITIES, connections);
  const mapLoadedPromise = map.load(initialMapData);

  // init update views
  const updateViews = initUpdateViews(map, calendar, database);

  // moving things around in the calendar
  calendar.on("legChanged", (connectionId) => {
    state.journeys.activeJourney.updateLeg(connectionId);
    updateViews(state);
  });

  // selecting a different journey
  map.on("alternativeJourneyClicked", (journeyId) => {
    state.journeys.setActive(journeyId);
    updateViews(state);
  });

  // clicking on a city
  map.on("cityHoverStart", (city) => {
    const target = `${state.home}->${city}`; // todo assumes home is set
    if (!ROUTES[target]) return;

    for (let route of ROUTES[target]) {
      const connectionIds = createStupidItineraryForRoute(route, database);
      state.journeys.addJourney(connectionIds);
    }
    updateViews(state);
  });
  map.on("cityHoverEnd", (city) => {
    state.journeys.removeJourneysWithDestination(city);
    updateViews(state);
  });

  // hovering over map or calender
  calendar.on("entryHoverStart", (leg) => map.setHoverState("leg", leg, true));
  calendar.on("entryHoverStop", (leg) => map.setHoverState("leg", leg, false));

  // now have done all we can do without having the map ready
  await mapLoadedPromise;
}
