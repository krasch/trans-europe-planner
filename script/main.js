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
  const alternatives = travelDatabase.getCachedAlternatives(
    state.activeItinerary,
    state.startDate,
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
  components.calendar.updateView(state.startDate, calendarData);

  // update perlschnur
  /*const perlschnurData = prepareDataForPerlschnur(state.activeItinerary);
  components.perlschnur.updateView(perlschnurData);*/
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

  components.calendar.on("connectionMoved", async (newConnectionId) => {
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

  components.calendar.on("connectionHover", async (connectionId, isHover) => {
    components.map.setHoverConnection(connectionId, isHover);
  });

  components.map.on("connectionHover", async (connectionId, isHover) => {
    components.calendar.setHoverConnection(connectionId, isHover);
  });

  components.datepicker.on("dateChanged", async (date) => {
    // todo
  });

  const itineraries = await travelDatabase.plan(
    // "de_de:13073:10401", // Stralsund
    "de_de:13074:1011", // Wismar
    "de_de:13003:1489_G", // Rostock
    state.startDate,
  );
  state.replaceItineraries(itineraries, true);

  await travelDatabase.triggerLoadAlternatives(
    state.activeItinerary,
    state.startDate,
  );

  // trigger initial update
  await updateComponents(state);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /*await travelDatabase.triggerLoadAlternatives(
    state.activeItinerary,
    state.startDate,
  );
  await sleep(3000);

  // loading finished update
  await updateComponents(state);

  for (let itinerary of state.otherItineraries) {
    travelDatabase.triggerLoadAlternatives(itinerary, state.startDate);
  }*/

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
