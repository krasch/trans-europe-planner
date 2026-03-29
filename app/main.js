import { CalendarWrapper } from "app/components/calendar.js";
import { Config } from "app/components/config.js";
import { MapWrapper } from "app/components/map.js";
import { Navigation } from "app/components/nav.js";
import { Perlschnur } from "app/components/perlschnur.js";
import { Planner } from "app/data/planner/planner.js";
import { render } from "app/render.js";
import { ConnectionId } from "app/types/connection.js";
import { getURLState, setURLState, URLObserver } from "app/url.js";

/**
 * @returns {Promise<Object.<string,any>>} components
 */
export async function init() {
  const urlState = getURLState();

  // initialise components, already do it now to trigger map loading asap
  const components = {
    map: new MapWrapper("map", urlState.center, urlState.zoom),
    config: new Config(document.querySelector("#config")),
    calendar: new CalendarWrapper(document.querySelector("travel-calendar")),
    perlschnur: new Perlschnur(document.querySelector("#perlschnur")),
    navigation: new Navigation(),
  };

  // nothing in form is filled out -> show landing page
  // wait until user clicks the "Try it out!" button
  // this also automatically closes the landing page
  if (!urlState.from && !urlState.to && !urlState.date)
    await components.navigation.showLandingPage();

  // landing page has been closed -> show main view
  components.navigation.showSidebar();
  components.map.setMapInteractive();

  return components;
}

/**
 * @param {Object.<string,any>} components
 */
export async function main(components) {
  const urlObserver = new URLObserver();
  const planner = new Planner();

  urlObserver.on("urlChanged", async () => {
    await render(components, planner, getURLState());
  });

  components.config.on("submit", async (from, to, date) => {
    setURLState(from.id, to.id, date, null); // triggers re-render
  });

  components.calendar.on("connectionMoved", (newConnectionIdString) => {
    const newConnectionId = ConnectionId.fromString(newConnectionIdString);
    const urlState = getURLState();

    // todo utils find position
    const matches = urlState.connectionIds
      .map((c, i) => i)
      .filter((i) => newConnectionId.isSameLeg(urlState.connectionIds[i]));

    // todo what if none found
    urlState.connectionIds[matches[0]] = newConnectionId;
    setURLState(
      urlState.from,
      urlState.to,
      urlState.date,
      urlState.connectionIds,
    );
  });

  components.map.on("itineraryClicked", (itineraryId) => {
    //const stops = itineraryId.split("->");
    //state.setActiveItinerary(itineraryId);
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

  // initial render
  await render(components, planner, getURLState());
}
