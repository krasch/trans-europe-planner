function main(map) {
  // temporary
  const defaultConnections = {
    "Berlin-München": "2024-10-16XICE503XBerlin-München",
    "München-Verona": "2024-10-16XRJ85XMünchen-Verona",
    "München-Bologna": "2024-10-16XEC87XMünchen-Bologna",
    "Verona-Roma": "2024-10-16XFR8529XVerona-Roma",
    "Bologna-Roma": "2024-10-17XFR9619XBologna-Roma",
    //"Verona-Firenze": "2024-10-17XFR8503XVerona-Firenze",
    //"Firenze-Livorno": "2024-10-17XR18289XFirenze-Livorno",
    //"Livorno-Bastia": "2024-10-18XCF1XLivorno-Bastia",
    "Berlin-Zürich": "2024-10-16XICE73XBerlin-Zürich",
    "Zürich-Milano": "2024-10-16XEC323XZürich-Milano",
    "Milano-Roma": "2024-10-17XFR9527XMilano-Roma",
    //"Zürich-Genova": "2024-10-17XEC327XZürich-Genova",
    //"Berlin-Karlsruhe": "2024-10-16XICE71XBerlin-Karlsruhe",
    //"Karlsruhe-Marseille": "2024-10-16XTGV9580XKarlsruhe-Marseille"
  };

  const legs = Object.keys(defaultConnections);
  const connections = temporalizeConnections(CONNECTIONS);
  const database = new Database(CITIES, STATIONS, legs, connections);

  const journey = new Map();
  for (let leg of ["Berlin-München", "München-Verona", "Verona-Roma"])
    journey[leg] = defaultConnections[leg];
  //journey["Berlin-Karlsruhe"] = defaultConnections["Berlin-Karlsruhe"];
  //journey["Karlsruhe-Marseille"] = defaultConnections["Karlsruhe-Marseille"];

  const calendar = document.getElementById("calendar");

  map.init();
  map.updateView(database.prepareDataForMap(journey));
  calendar.updateView(database.prepareDataForCalendar(journey));

  calendar.on("entryStartHover", (leg) => map.setHover(leg));
  calendar.on("entryStopHover", (leg) => map.setNoHover(leg));
  map.on("legStartHover", (leg) => calendar.setHover(leg));
  map.on("legStopHover", (leg) => calendar.setNoHover(leg));

  map.on("legAdded", (leg) => {
    journey[leg] = defaultConnections[leg];
    map.updateView(database.prepareDataForMap(journey));
    calendar.updateView(database.prepareDataForCalendar(journey));
  });

  map.on("legRemoved", (leg) => {
    delete journey[leg];
    map.updateView(database.prepareDataForMap(journey));
    calendar.updateView(database.prepareDataForCalendar(journey));
  });

  calendar.on("legChanged", (leg, connectionId) => {
    journey[leg] = connectionId;
    calendar.updateView(database.prepareDataForCalendar(journey));
  });
}
