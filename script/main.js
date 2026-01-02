import { prepareDataForCalendar } from "script/data/components/calendar.js";
import { prepareDataForMap } from "script/data/components/map.js";
import { prepareDataForPerlschnur } from "script/data/components/perlschnur.js";
import { Planner } from "script/planner.js";
import { State } from "script/state.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {Object.<string,any>} components
 * @param {Planner} planner
 * @param {State} state
 */
async function updateAllComponents(components, planner, state) {
  if (!state.activeItinerary) return;

  // todo move back into state? what if empty?
  const travelDate = components.config.date;

  // alternatives for all the connections in current active itinerary - needed for calendar
  const alternatives = planner.getCachedAlternatives(
    state.activeItinerary,
    travelDate,
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
  components.calendar.updateView(travelDate, calendarData);

  // update perlschnur
  const perlschnurData = prepareDataForPerlschnur(state.activeItinerary);
  components.perlschnur.updateView(perlschnurData);
}

/**
 * @param {Object.<string,any>} components
 * @param {Planner} travelDatabase
 */
export async function main(components, travelDatabase) {
  const state = new State();

  // partial function for conveniently updating the components
  const updateComponents = updateAllComponents.bind(
    null, // sic
    components,
    travelDatabase,
  );

  components.config.on("submit", async (from, to, date) => {
    components.config.lock();

    const itineraries = await travelDatabase.plan(from, to, date);
    state.replaceItineraries(itineraries, true);
    //await sleep(1000);

    // draw first updates (calendar has no alternatives yet -> no drag&drop)
    await updateComponents(state);
    components.config.unlock();

    components.mainContainer
      .querySelector("#nav-tab-config")
      .classList.remove("selected");
    components.mainContainer
      .querySelector("#config")
      .classList.remove("selected");
    components.mainContainer
      .querySelector("#nav-tab-calendar")
      .classList.add("selected");
    components.mainContainer
      .querySelector("#calendar")
      .classList.add("selected");

    // load alternatives for calendar events and redraw
    await travelDatabase.triggerLoadAlternatives(state.activeItinerary, date);
    await updateComponents(state);

    // already trigger this in case use selects different route
    // not awaiting here because don't need it right now
    for (let itinerary of state.otherItineraries) {
      travelDatabase.triggerLoadAlternatives(itinerary, date);
    }
  });

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
    components.map.setConnectionHover(connectionId, isHover);
  });

  components.map.on("connectionHover", async (connectionId, isHover) => {
    components.calendar.setConnectionHover(connectionId, isHover);
    components.perlschnur.setConnectionHover(connectionId, isHover);
  });

  components.perlschnur.on("connectionHover", async (connectionId, isHover) => {
    components.calendar.setConnectionHover(connectionId, isHover);
    components.map.setConnectionHover(connectionId, isHover);
  });

  components.map.on("stopHover", async (stopId, isHover) => {
    components.perlschnur.setStopHover(stopId, isHover);
  });

  components.perlschnur.on("stopHover", async (stopId, isHover) => {
    components.map.setStopHover(stopId, isHover);
  });
}
