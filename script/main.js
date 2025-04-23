import { Database } from "./data/database.js";
import { diffDays, RouteDatabase } from "./data/routing.js";
import { Journey, JourneyCollection } from "./data/types/journey.js";

import {
  prepareInitialDataForMap,
  prepareDataForMap,
  prepareDataForCalendar,
  prepareDataForPerlschnur,
} from "./data/componentData.js";

function initUpdateViews(views, database) {
  // todo pass this in?
  const mainContainer = document.querySelector("main");

  function updateViews(state) {
    views.map.updateView(prepareDataForMap(state.journeys, database));
    views.calendar.updateView(
      prepareDataForCalendar(state.date, state.journeys, database),
    );
    views.perlschnur.updateView(
      prepareDataForPerlschnur(state.journeys, database),
    );

    // this controls which content is currently visible
    if (state.journeys.hasActiveJourney)
      mainContainer.classList.remove("no-journey");
    else mainContainer.classList.add("no-journey");
  }
  return updateViews;
}

export function main(home, views, data) {
  // init state
  const state = {
    home: home,
    date: views.datepicker.currentDate,
    journeys: new JourneyCollection(),
  };

  // prepare databases
  // todo move into init and into worker?
  const database = new Database(data.connections);
  const routeDatabase = new RouteDatabase(data.routes);

  // prepare all geo etc data that map needs
  const initialMapData = prepareInitialDataForMap(
    state.home,
    data.cities,
    data.connections,
    routeDatabase,
  );

  // and add that data to the map
  views.map.initMapData(initialMapData);

  // closure magic
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

  updateViews(state);
}
