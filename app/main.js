import { prepareDataForCalendar } from "app/components/_data/calendar.js";
import { prepareDataForMap } from "app/components/_data/map.js";
import { prepareDataForPerlschnur } from "app/components/_data/perlschnur.js";
import { CalendarWrapper } from "app/components/calendar.js";
import { Config } from "app/components/config.js";
import { Navigation } from "app/components/nav.js";
import { Perlschnur } from "app/components/perlschnur.js";
import { Planner } from "app/planner.js";
import { State } from "app/state.js";
import { LocationObserver } from "app/util.js";

import { MapWrapper } from "./components/map.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {Object.<string,any>} components
 * @param {Planner} planner
 * @param {State} state
 */
async function updateAllComponents(components, planner, state) {
  // update config
  components.config.updateView(state.from, state.to, state.date);

  if (!state.activeItinerary) return;

  // alternatives for all the connections in current active itinerary - needed for calendar
  const alternatives = planner.getCachedAlternatives(
    state.activeItinerary,
    state.date,
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
  components.calendar.updateView(state.date.toISODate(), calendarData);

  // update perlschnur
  const perlschnurData = prepareDataForPerlschnur(state.activeItinerary);
  components.perlschnur.updateView(perlschnurData);
}

export async function main() {
  // initialise state from URL
  const params = new URLSearchParams(window.location.search);
  const state = new State(params);

  // initialise components
  const navigation = new Navigation();
  const components = {
    map: new MapWrapper("map", state.center, state.zoom), // triggers map load
    config: new Config(document.querySelector("#config")),
    calendar: new CalendarWrapper(document.querySelector("travel-calendar")),
    perlschnur: new Perlschnur(document.querySelector("#perlschnur")),
  };

  // show landing page
  // wait until user clicks the "Try it out!" button
  // this also automatically closes the landing page
  if (params.size === 0) await navigation.showLandingPage();

  // landing page has been closed -> show main view
  navigation.showSidebar();
  components.map.setMapInteractive();

  const planner = new Planner();

  // partial function for conveniently updating the components
  const updateComponents = updateAllComponents.bind(
    null, // sic
    components,
    planner,
  );

  updateComponents(state);

  // url location has changed
  new LocationObserver().on("updated", () => {
    console.log(window.location.search);
  });

  state.on("itineraryUpdated", async () => {
    await updateComponents(state);
  });

  state.on("configUpdated", async () => {
    components.config.lock();
    const itineraries = await planner.plan(state.from, state.to, state.date);
    state.replaceItineraries(itineraries); // triggers redraw
    navigation.focusComponent("calendar");
    components.config.unlock();

    // load alternatives for calendar events and redraw
    await planner.triggerLoadAlternatives(state.activeItinerary, state.date);
    await updateComponents(state);

    // already trigger this in case use selects different route
    // not awaiting here because don't need it right now
    for (let itinerary of state.otherItineraries) {
      planner.triggerLoadAlternatives(itinerary, state.date);
    }
  });

  components.config.on("submit", async (from, to, date) => {
    state.setConfigFormValues(from, to, date);
  });

  components.calendar.on("connectionMoved", (newConnectionId) => {
    const connection = planner.getConnectionById(newConnectionId);
    state.replaceLegInActiveItinerary(connection);
  });

  components.map.on("itineraryClicked", (itineraryId) => {
    state.setActiveItinerary(itineraryId);
  });

  /*********************************
   hover interactions below
  **********************************/

  components.calendar.on("connectionHover", (connectionId, isHover) => {
    components.map.setConnectionHover(connectionId, isHover);
  });

  components.map.on("connectionHover", (connectionId, isHover) => {
    components.calendar.setConnectionHover(connectionId, isHover);
    components.perlschnur.setConnectionHover(connectionId, isHover);
  });

  components.perlschnur.on("connectionHover", (connectionId, isHover) => {
    components.calendar.setConnectionHover(connectionId, isHover);
    components.map.setConnectionHover(connectionId, isHover);
  });

  components.map.on("stopHover", (stopId, isHover) => {
    components.perlschnur.setStopHover(stopId, isHover);
  });

  components.perlschnur.on("stopHover", (stopId, isHover) => {
    components.map.setStopHover(stopId, isHover);
  });
}
