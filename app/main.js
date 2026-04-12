import { CalendarWrapper } from "app/components/calendar.js";
import { Config } from "app/components/config.js";
import { MapWrapper } from "app/components/map.js";
import { Navigation } from "app/components/nav.js";
import { Perlschnur } from "app/components/perlschnur.js";
import { URL_DEFAULTS } from "app/config.js";
import { Planner } from "app/data/planner/planner.js";
import { render } from "app/render.js";
import { ConnectionId } from "app/types/connection.js";
import { getURLState, setURLState, URLObserver } from "app/url.js";
import { findFirstPosition } from "app/utils/collections.js";

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
  if (!urlState.from && !urlState.to && !urlState.calendarStartDate)
    await components.navigation.showLandingPage();

  // landing page has been closed -> show main view
  components.navigation.showSidebar();
  components.map.setMapInteractive();

  if (!urlState.calendarStartDate)
    setURLState(
      urlState.from,
      urlState.to,
      URL_DEFAULTS.calDate,
      urlState.active,
      urlState.alternatives,
    );

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

  components.config.on("submit", async (fromId, toId, calenderStartDate) => {
    setURLState(fromId, toId, calenderStartDate, null, []); // triggers re-render
  });

  components.calendar.on("connectionMoved", (newConnectionIdString) => {
    const newConnectionId = ConnectionId.fromString(newConnectionIdString);
    const urlState = getURLState();

    if (!urlState.active) return;

    // at what position in the itinerary is this connection?
    const position = findFirstPosition(urlState.active, (id) =>
      newConnectionId.isSameLeg(id),
    );

    // the connection is not in the current itinerary todo error logging
    if (position === null) return;

    // the connection has not actually changed
    if (urlState.active[position].equals(newConnectionId)) return;

    urlState.active[position] = newConnectionId;

    // triggers re-render
    setURLState(
      urlState.from,
      urlState.to,
      urlState.calendarStartDate,
      urlState.active, // has been updated
      urlState.alternatives,
    );
  });

  components.map.on("itineraryClicked", (geoRouteString) => {
    const urlState = getURLState();

    const calcGeoRoute = (connectionIds) => {
      let ids = connectionIds.map((c) => c.fromStopId);
      ids.push(connectionIds.at(-1).toStopId);
      return ids.join("->");
    };

    // clicked on the currently active itinerary, nothing to do
    if (urlState.active && calcGeoRoute(urlState.active) === geoRouteString)
      return;

    // which alternative itinerary did user click on?
    const position = findFirstPosition(
      urlState.alternatives,
      (r) => calcGeoRoute(r) === geoRouteString,
    );

    // there is no itinerary with this geoRoute todo error logging
    if (position === null) return;

    const active = urlState.alternatives[position];
    urlState.alternatives[position] = urlState.active;

    // triggers re-render
    setURLState(
      urlState.from,
      urlState.to,
      urlState.calendarStartDate,
      active, // has been updated
      urlState.alternatives, // has been updated
    );
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
