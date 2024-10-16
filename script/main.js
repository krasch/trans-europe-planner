ROUTES = {
  "Berlin->Roma over Verona": {
    "Berlin-München": "2024-10-16XICE503XBerlin-München",
    "München-Verona": "2024-10-16XRJ85XMünchen-Verona",
    "Verona-Roma": "2024-10-16XFR8529XVerona-Roma",
  },
  "Berlin->Roma over Bologna": {
    "Berlin-München": "2024-10-16XICE503XBerlin-München",
    "München-Bologna": "2024-10-16XEC87XMünchen-Bologna",
    "Bologna-Roma": "2024-10-17XFR9619XBologna-Roma",
  },
  "Berlin-Roma over Zürich": {
    "Berlin-Zürich": "2024-10-16XICE73XBerlin-Zürich",
    "Zürich-Milano": "2024-10-16XEC323XZürich-Milano",
    "Milano-Roma": "2024-10-17XFR9527XMilano-Roma",
  },
};

class Journey {
  constructor(defaultConnections) {
    this.defaults = defaultConnections;
    this.connections = {};
  }

  get legs() {
    return Object.keys(this.defaults);
  }

  static fromDefaults(defaultConnections) {
    const journey = new Journey(defaultConnections);
    for (let leg in defaultConnections)
      journey.connections[leg] = defaultConnections[leg];
    return journey;
  }
}

function initUpdateViews(map, calendar, journeySelection, database) {
  function updateViews(journeys, active) {
    const journey = journeys[active].connections;
    const allLegs = Object.values(journeys).flatMap((j) => j.legs);

    map.updateView(database.prepareDataForMap(journey, allLegs));
    calendar.updateView(database.prepareDataForCalendar(journey));
    journeySelection.updateView(
      database.prepareDataForJourneySelection(journeys, active),
    );
  }
  return updateViews;
}

function main(map, calendar, journeySelection) {
  // init database
  const connections = temporalizeConnections(CONNECTIONS); // todo dates here
  const database = new Database(CITIES, STATIONS, connections);

  // init state
  const journeys = {
    journey1: Journey.fromDefaults(ROUTES["Berlin->Roma over Verona"]),
    journey2: Journey.fromDefaults(ROUTES["Berlin->Roma over Bologna"]),
    journey3: Journey.fromDefaults(ROUTES["Berlin-Roma over Zürich"]),
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
    journeys[active].connections[leg] = journeys[active].defaults[leg];
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
