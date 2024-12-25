const DUMMY_DATE_STRING = "2024-12-01";
const DUMMY_DATE = new Date(DUMMY_DATE_STRING);

function initUpdateViews(map, calendar, sidebar, database) {
  function updateViews(state) {
    //calendar.setAttribute("start", dateOnlyISOString(state.date));

    map.updateView(prepareDataForMap(state.journeys, database));
    calendar.updateView(prepareDataForCalendar(state.journeys, database));

    if (state.journeys.hasActiveJourney) {
      sidebar.show();
      if (state.date !== null) calendar.show();
      else calendar.hide();
    } else {
      sidebar.hide();
      calendar.hide();
    }
  }
  return updateViews;
}

async function main(home, map, calendar, sidebar) {
  // init state
  const state = {
    date: sidebar.currentDate,
    journeys: new JourneyCollection(),
  };

  // prepare database
  const connections = CONNECTIONS.flatMap((c) =>
    enrichConnection(c, STATIONS, CITIES, DUMMY_DATE_STRING),
  );
  const database = new Database(connections);

  // prepare routes
  const routeDatabase = new RouteDatabase(ROUTES);

  // prepare all geo etc data that map needs
  const initialMapData = prepareInitialDataForMap(
    home,
    CITIES,
    connections,
    routeDatabase,
  );
  const mapLoadedPromise = map.load(initialMapData);

  // init update views
  const updateViews = initUpdateViews(map, calendar, sidebar, database);

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
    const itineraries = routeDatabase.getItineraries(
      home,
      cityName,
      state.date || DUMMY_DATE,
      database,
    );
    const journeys = itineraries.map((i) => new Journey(i));

    state.journeys.reset();
    for (let j of journeys) state.journeys.addJourney(j);
    state.journeys.setActive(journeys[0].id); // first journey is the one with the fewest transfers

    updateViews(state);
  });

  /*map.on("showCalendar", (journeyId) => {
    sidebar.show();
  });*/

  map.on("cutJourney", (cityName) => {
    state.journeys.cutActiveJourney(cityName, database);
  });

  // hovering over map or calender
  calendar.on("entryHoverStart", (leg) => map.setLegHoverState(leg, true));
  calendar.on("entryHoverStop", (leg) => map.setLegHoverState(leg, false));

  sidebar.on("dateChanged", (date) => {
    state.date = date;
    updateViews(state); // todo if a date is still set this might trigger an updateViews before the initial updateViews
  });

  // now have done all we can do without having the map ready
  await mapLoadedPromise;

  updateViews(state);
}
