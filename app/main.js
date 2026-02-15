import { prepareDataForCalendar } from "app/components/_data/calendar.js";
import { prepareDataForMap } from "app/components/_data/map.js";
import { prepareDataForPerlschnur } from "app/components/_data/perlschnur.js";
import { Planner } from "app/planner.js";
import { State2 } from "app/state2.js";
import { State } from "app/state.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  const start = params.get("start");
  return start;
}

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
  components.calendar.updateView(travelDate.toISODate(), calendarData);

  // update perlschnur
  const perlschnurData = prepareDataForPerlschnur(state.activeItinerary);
  components.perlschnur.updateView(perlschnurData);
}

/**
 * @param {Object.<string,any>} components
 * @param {Planner} planner
 */
export async function main(components, planner) {
  const start = parseURLParams();
  if (start) {
    document.querySelector("#config-from").setAttribute("value", start);
    document.querySelector("dialog").close();
  }

  const state = new State();
  const state2 = new State2();

  // partial function for conveniently updating the components
  const updateComponents = updateAllComponents.bind(
    null, // sic
    components,
    planner,
  );

  components.config.on("submit", async (from, to, date) => {
    components.config.lock();
    state2.start = from;
    state2.destination = to;
    state2.date = date;

    const itineraries = await planner.plan(from, to, date);
    state.replaceItineraries(itineraries);
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
    await planner.triggerLoadAlternatives(state.activeItinerary, date);
    await updateComponents(state);

    // already trigger this in case use selects different route
    // not awaiting here because don't need it right now
    for (let itinerary of state.otherItineraries) {
      planner.triggerLoadAlternatives(itinerary, date);
    }
  });

  components.calendar.on("connectionMoved", async (newConnectionId) => {
    const connection = planner.getConnectionById(newConnectionId);
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
