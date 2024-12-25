// dummy date for initialising
// today so that it is in range for date picker
// double "new Date" so that can get rid of time component
const TODAY = new Date(new Date().toLocaleDateString("sv"));

function diffDays(datetime, laterDatetime) {
  // get rid of hours/minutes/seconds
  datetime = new Date(datetime.toDateString());
  laterDatetime = new Date(laterDatetime.toDateString());

  const diffMillis = laterDatetime - datetime;
  return Math.ceil(diffMillis / (1000 * 60 * 60 * 24));
}

function initUpdateViews(map, calendar, sidebar, database) {
  function updateViews(state) {
    map.updateView(prepareDataForMap(state.journeys, database));
    calendar.updateView(
      prepareDataForCalendar(state.date, state.journeys, database),
    );

    if (state.journeys.hasActiveJourney) {
      sidebar.show();
      if (sidebar.currentDate !== null) calendar.show();
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
    date: sidebar.currentDate || TODAY,
    journeys: new JourneyCollection(),
  };

  // redraw calendar header
  calendar.setAttribute("start", dateOnlyISOString(state.date));

  // prepare database
  // todo having troubles with trains starting before 01:00 because than diffDays does not work correctly
  const connections = CONNECTIONS.flatMap((c) =>
    enrichConnection(c, STATIONS, CITIES, TODAY.toLocaleDateString("sv")),
  ).filter((c) => c.stops[0].departure.getHours() > 0);
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
  calendar.on("legChanged", (newConnectionId) => {
    state.journeys.activeJourney.replaceLeg(newConnectionId);
    updateViews(state);
  });

  map.on("selectJourney", (journeyId) => {
    state.journeys.setActive(journeyId);
    updateViews(state);
  });

  map.on("showCityRoutes", (cityName) => {
    const itineraries = routeDatabase.getItineraries(
      home,
      cityName,
      state.date,
      database,
    );
    const journeys = itineraries.map((i) => new Journey(i));

    state.journeys.reset();
    for (let j of journeys) state.journeys.addJourney(j);
    state.journeys.setActive(journeys[0].id); // first journey is the one with the fewest transfers

    updateViews(state);
  });

  map.on("cutJourney", (cityName) => {
    state.journeys.activeJourney.split(cityName); // todo option to split only for active journey? or pass journey id back here
  });

  calendar.on("entryHoverStart", (leg) => map.setLegHoverState(leg, true));
  calendar.on("entryHoverStop", (leg) => map.setLegHoverState(leg, false));

  sidebar.on("dateChanged", (date) => {
    const diff = diffDays(state.date, date);
    if (diff === 0) return;

    state.journeys.shiftDate(diff, database);
    state.date = date;
    calendar.setAttribute("start", dateOnlyISOString(state.date));

    updateViews(state);
  });

  // now have done all we can do without having the map ready
  await mapLoadedPromise;

  updateViews(state);
}
