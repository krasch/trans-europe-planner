ALLDEFAULTS = {
  "Berlin-München": "2024-10-16XICE503XBerlin-München",
  "München-Verona": "2024-10-16XRJ85XMünchen-Verona",
  "Verona-Roma": "2024-10-16XFR8529XVerona-Roma",
  "München-Bologna": "2024-10-17XRJ81XMünchen-Bologna",
  "Bologna-Roma": "2024-10-17XFR9637XBologna-Roma",
  "Berlin-Zürich": "2024-10-16XICE73XBerlin-Zürich",
  "Zürich-Milano": "2024-10-16XEC323XZürich-Milano",
  "Milano-Roma": "2024-10-17XFR9527XMilano-Roma",
};

ROUTES = {
  "Berlin->Roma over Verona": [
    "Berlin-München",
    "München-Verona",
    "Verona-Roma",
  ],
  "Berlin->Roma over Bologna": [
    "Berlin-München",
    "München-Bologna",
    "Bologna-Roma",
  ],
  "Berlin->Roma over Zürich": ["Berlin-Zürich", "Zürich-Milano", "Milano-Roma"],
};

STARTS = {
  "Berlin->Roma over Verona": new CustomDateTime("2024-10-16", "07:00:00"),
  "Berlin->Roma over Bologna": new CustomDateTime("2024-10-16", "09:00:00"),
  "Berlin->Roma over Zürich": new CustomDateTime("2024-10-16", "09:00:00"),
};

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

function main(map, calendar, journeySelection) {
  // init database
  const connections = temporalizeConnections(CONNECTIONS); // todo dates here
  const database = new Database(CITIES, STATIONS, connections);

  // build itineraries
  const initial = {};
  for (let key in ROUTES) {
    const legs = ROUTES[key];
    const connections = createItineraryForRoute(legs, STARTS[key], database);

    // todo use better data structures
    const map = {};
    for (let i in legs) {
      map[legs[i]] = connections[i];
    }

    initial[key] = map;
  }

  // init state
  const journeys = {
    journey1: Journey.fromDefaults(initial["Berlin->Roma over Verona"]),
    journey2: Journey.fromDefaults(initial["Berlin->Roma over Bologna"]),
    journey3: Journey.fromDefaults(initial["Berlin->Roma over Zürich"]),
  };
  let active = "journey3";

  // draw initial journey
  const updateViews = initUpdateViews(
    map,
    calendar,
    journeySelection,
    database,
  );
  updateViews(journeys, active);

  // hovering over map or calender
  calendar.on("entryStartHover", (leg) => map.setHover(leg));
  calendar.on("entryStopHover", (leg) => map.setNoHover(leg));
  map.on("legStartHover", (leg) => calendar.setHover(leg));
  map.on("legStopHover", (leg) => calendar.setNoHover(leg));

  //changing the journey
  map.on("legAdded", (leg) => {
    let connection = journeys[active].defaults[leg];
    if (!connection) connection = ALLDEFAULTS[leg];

    journeys[active].connections[leg] = connection;
    updateViews(journeys, active);
  });
  map.on("legRemoved", (leg) => {
    delete journeys[active].connections[leg];
    updateViews(journeys, active);
  });
  calendar.on("legChanged", (leg, connectionId) => {
    journeys[active].connections[leg] = connectionId;
    updateViews(journeys, active);
  });
  journeySelection.on("journeySelected", (journeyId) => {
    active = journeyId;
    updateViews(journeys, active);
  });
}
