import { prepareDataForCalendar } from "script/data/components/calendar.js";
import { prepareDataForMap } from "script/data/components/map.js";
import { prepareDataForPerlschnur } from "script/data/components/perlschnur.js";
import { TravelDatabase } from "script/data/travelDatabase.js";
import { State } from "script/state.js";

/**
 * @param {Object.<string,any>} components
 * @param {TravelDatabase} travelDatabase
 * @param {State} state
 */
async function updateAllComponents(components, travelDatabase, state) {
  // alternatives for all the connections in current active itinerary - needed for calendar
  const alternatives = travelDatabase.getAlternatives(
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
  /*const perlschnurData = prepareDataForPerlschnur(state.activeItinerary);
  components.perlschnur.updateView(perlschnurData);

  // make calendar/perlschnur visible if there is an active journey
  if (state.activeItinerary)
    components.mainContainer.classList.remove("no-journey");
  else components.mainContainer.classList.add("no-journey");*/
}

/**
 * @param {Object.<string,any>} components
 * @param {TravelDatabase} travelDatabase
 */
export async function main(components, travelDatabase) {
  const state = new State(components.datepicker.currentDate);

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

  components.map.on("itineraryClicked", async (itineraryId) => {
    if (state.activeItinerary.id !== itineraryId) {
      state.setActiveItinerary(itineraryId);
      await updateComponents(state);
    }
  });

  components.datepicker.on("dateChanged", async (date) => {
    // todo
  });

  const itineraries = await travelDatabase.plan(
    // "de_de:13073:10401", // Stralsund
    "de_de:13074:1011", // Wismar
    "de_de:13003:1489_G", // Rostock
    state.desiredStartDate,
  );
  state.replaceItineraries(itineraries, true);

  // trigger initial update
  await updateComponents(state);

  state.activeItinerary.summary;

  for (let connection of state.activeItinerary.connections) {
    travelDatabase.direct(
      connection.from.stopId,
      connection.to.stopId,
      state.desiredStartDate,
    );
  }

  for (let itinerary of state.otherItineraries) {
    for (let connection of itinerary.connections) {
      travelDatabase.direct(
        connection.from.stopId,
        connection.to.stopId,
        state.desiredStartDate,
      );
    }
  }

  /*const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  await sleep(1000);

  components.map.setHoverStop("de_de:13003:1489", true);
  components.map.setHoverStop("de_de:13072:125_G", true);*/

  /*components.map.setHoverConnection(
    "20250910_04:42_de_2873716364XXXde_de:13074:1011XXXde_de:13003:1489",
    true,
  );*/

  /*for (let event of [
    "stopHoverOn",
    "stopHoverOff",
    "stopClicked",
    "itineraryHoverOn",
    "itineraryHoverOff",
    "itineraryClicked",
  ]) {
    components.map.on(event, (id) => console.log(event, id));
  }*/
}
