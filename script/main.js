import { Database } from "./data/database.js";
import { diffDays, RouteDatabase } from "./data/routing.js";
import { Journey, JourneyCollection } from "./data/types/journey.js";

import { enrichConnection } from "./data/database.js";
import {
  prepareInitialDataForMap,
  prepareDataForMap,
  prepareDataForCalendar,
  prepareDataForPerlschnur,
} from "./data/componentData.js";

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

export async function main(home, views, data) {
  // init state
  const state = {
    home: home,
    date: views.datepicker.currentDate,
    journeys: new JourneyCollection(),
  };

  // prepare database
  const connections = data.connections.flatMap((c) =>
    enrichConnection(c, data.stations, data.cities, state.date.toISODate()),
  );

  const database = new Database(connections);

  // prepare routes
  const routeDatabase = new RouteDatabase(data.routes);

  // prepare all geo etc data that map needs
  const initialMapData = prepareInitialDataForMap(
    state.home,
    data.cities,
    connections,
    routeDatabase,
  );
  const mapLoadedPromise = views.map.load(initialMapData);

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
      state.home,
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
    const diff = diffDays(state.date, date);
    if (diff === 0) return;

    state.journeys.shiftDate(diff, database);
    state.date = date;

    updateViews(state);
  });

  // now have done all we can do without having the map ready
  await mapLoadedPromise;

  updateViews(state);
}
