// dummy date for initialising
// today so that it is in range for date picker
// double "new Date" so that can get rid of time component
const TODAY = luxon.DateTime.now().startOf("day");

function initUpdateViews(views, database) {
  function updateViews(state) {
    views.map.updateView(prepareDataForMap(state.journeys, database));
    views.calendar.updateView(
      prepareDataForCalendar(state.date, state.journeys, database),
    );
    views.perlschnur.updateView(
      prepareDataForPerlschnur(state.journeys, database),
    );

    views.layout.updateView(
      views.datepicker.currentDate !== null,
      state.journeys.hasActiveJourney,
    );
  }
  return updateViews;
}

async function main(home, views) {
  // init state
  const state = {
    date: views.datepicker.currentDate || TODAY,
    journeys: new JourneyCollection(),
  };

  // redraw calendar header
  views.calendar.travelCalendar.setAttribute(
    "start-date",
    state.date.toISODate(),
  );

  // prepare database
  // todo having troubles with trains starting before 01:00 because than diffDays does not work correctly
  const connections = CONNECTIONS.flatMap(
    (c) => enrichConnection(c, STATIONS, CITIES, TODAY.toISODate()), // todo can use state.date here?
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
  const mapLoadedPromise = views.map.load(initialMapData);

  const itineraries = routeDatabase.getItineraries(
    home,
    "Napoli",
    state.date,
    database,
  );
  const journeys = itineraries.map((i) => new Journey(i));
  state.journeys.reset();
  for (let j of journeys) state.journeys.addJourney(j);
  state.journeys.setActive(journeys[1].id);

  // init update views
  const updateViews = initUpdateViews(views, database);

  // moving things around in the calendar
  views.calendar.on("legChanged", (newConnectionId) => {
    state.journeys.activeJourney.replaceLeg(newConnectionId);
    updateViews(state);
  });

  views.map.on("selectJourney", (journeyId) => {
    state.journeys.setActive(journeyId);
    updateViews(state);
  });

  views.map.on("showCityRoutes", (cityName) => {
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

  views.map.on("cutJourney", (cityName) => {
    state.journeys.activeJourney.split(cityName); // todo option to split only for active journey? or pass journey id back here
  });

  views.calendar.on("legHoverStart", (leg) => {
    views.map.setLegHoverState(leg, true);
  });

  views.calendar.on("legHoverStop", (leg) =>
    views.map.setLegHoverState(leg, false),
  );

  views.datepicker.on("dateChanged", (date) => {
    if (date === null) date = TODAY;

    const diff = diffDays(state.date, date);
    if (diff === 0) return;

    state.journeys.shiftDate(diff, database);
    state.date = date;

    views.calendar.travelCalendar.setAttribute(
      "start-date",
      state.date.toISODate(),
    );

    updateViews(state);
  });

  // now have done all we can do without having the map ready
  await mapLoadedPromise;

  updateViews(state);
}
