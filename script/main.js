import { State } from "./state.js";
import {
  prepareInitialDataForMap,
  prepareDataForMap,
} from "./data/components/map.js";
import { prepareDataForCalendar } from "./data/components/calendar.js";
import { prepareDataForPerlschnur } from "./data/components/perlschnur.js";
import { TravelDatabase } from "./data/travelDatabase.js";

/**
 * @param {Object.<string,any>} components
 * @param {TravelDatabase} travelDatabase
 * @param {State} state
 */
async function updateAllComponents(components, travelDatabase, state) {
  // alternatives for all the connections in current active itinerary - needed for calendar
  const alternatives = await travelDatabase.getAlternatives(
    state.activeItinerary,
    state.desiredStartDate,
  );

  // update map
  const mapData = prepareDataForMap(
    state.activeItinerary,
    state.otherItineraries,
  );
  components.map.updateView(mapData);

  // update calendar
  const calendarData = prepareDataForCalendar(
    state.activeItinerary,
    alternatives,
  );
  components.calendar.updateView(state.desiredStartDate, calendarData);

  // update perlschnur
  const perlschnurData = prepareDataForPerlschnur(state.activeItinerary);
  components.perlschnur.updateView(perlschnurData);

  // make calendar/perlschnur visible if there is an active journey
  if (state.activeItinerary)
    components.mainContainer.classList.remove("no-journey");
  else components.mainContainer.classList.add("no-journey");
}

/**
 * @param {string} homeCityId
 * @param {Object.<string,any>} components
 * @param {TravelDatabase} travelDatabase
 */
export async function main(homeCityId, components, travelDatabase) {
  const state = new State(homeCityId, components.datepicker.currentDate);

  // prepare all geo etc data that map needs
  const initialMapData = prepareInitialDataForMap(
    state.homeCityId,
    travelDatabase.geoDatabase.geoDataForAllCities,
  );

  // and add that data to the map
  components.map.initMapData(initialMapData);

  // partial function for conveniently updating the components
  const updateComponents = updateAllComponents.bind(
    null, // sic
    components,
    travelDatabase,
  );

  // moving things around in the calendar
  components.calendar.on("legChanged", async (newConnectionId) => {
    const connection = travelDatabase.getCachedConnection(newConnectionId);
    state.replaceLegInActiveItinerary(connection);
    await updateComponents(state);
  });

  components.map.on("selectJourney", async (journeyId) => {
    state.setActiveItinerary(journeyId);
    await updateComponents(state);
  });

  components.map.on("showCityRoutes", async (targetCityId) => {
    const itineraries = await travelDatabase.plan(
      state.homeCityId,
      targetCityId,
      state.desiredStartDate,
    );

    state.replaceItineraries(itineraries, true);
    await updateComponents(state);
  });

  components.calendar.on("legHoverStart", (/** @type {string} */ leg) => {
    components.map.setLegHoverState(leg, true);
  });

  components.calendar.on("legHoverStop", (/** @type {string} */ leg) =>
    components.map.setLegHoverState(leg, false),
  );

  components.datepicker.on("dateChanged", async (date) => {
    // todo
    /*const diff = diffDays(state.date, date);
    if (diff === 0) return;

    state.itineraries.shiftDate(diff, geoDatabase);
    state.date = date;

    await updateComponents(state);*/
  });

  // trigger initial update
  await updateComponents(state);
}
