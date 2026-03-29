import { prepareDataForCalendar } from "app/components/_data/calendar.js";
import { prepareDataForMap } from "app/components/_data/map.js";
import { prepareDataForPerlschnur } from "app/components/_data/perlschnur.js";
import { CalendarWrapper } from "app/components/calendar.js";
import { Config } from "app/components/config.js";
import { MapWrapper } from "app/components/map.js";
import { Navigation } from "app/components/nav.js";
import { Perlschnur } from "app/components/perlschnur.js";
// todo should all come from planner
import { getStopInfo } from "app/data/motis/client.js";
import { Planner } from "app/data/planner/planner.js";
import { ConnectionId } from "app/types/connection.js";
import { parseURLParams, updateURL, URLObserver } from "app/url.js";

/**
 * @typedef {import("app/url.js").ParsedURLData} ParsedURLData
 */

/**
 * @param {Object.<string,any>} components
 * @param {Planner} planner
 * @param {ParsedURLData} urlData
 */
export async function render(components, planner, urlData) {
  let from = null;
  if (urlData.from) from = await getStopInfo(urlData.from);

  let to = null;
  if (urlData.to) to = await getStopInfo(urlData.to);

  // update config form
  components.config.updateView(from?.name, to?.name, urlData.date);

  // form is not fully filled out -> nothing else to render
  if (!from || !to || !urlData.date) return;

  // currently no active itinerary
  // -> run planning and pick an itinerary from the results
  if (urlData.connectionIds.length === 0) {
    const itineraries = await planner.plan(from.id, to.id, urlData.date);
    const active = itineraries[0];

    // this will trigger an event which will trigger another round of render()
    // during that render we will gather all that other data we need
    updateURL(urlData.from, urlData.to, urlData.date, active);
    return;
  }

  // we have trip ids in the url -> need to gather the data to build itinerary
  components.config.lock();
  const active = await planner.itineraryForIds(
    urlData.connectionIds,
    urlData.date,
  );

  // alternatives for all the connections in current active itinerary - needed for calendar
  const alternatives = await planner.allAlternativeConnections(
    active,
    urlData.date,
  );

  // now all the alternative georoutes - needed for map
  const other = await planner.alternativeRouteItineraries(active, urlData.date);

  // todo trigger loading alternative connections for alternative routes

  // update map
  const mapData = prepareDataForMap(active, other);
  components.map.updateView(mapData);

  // update calendar
  const calendarData = prepareDataForCalendar(active, alternatives);
  components.calendar.updateView(urlData.date.toISODate(), calendarData);

  // update perlschnur
  const perlschnurData = prepareDataForPerlschnur(active);
  components.perlschnur.updateView(perlschnurData);

  // todo can probably unlock earlier
  components.config.unlock();
}

export async function main() {
  const urlParams = parseURLParams(window.location.search);
  const urlObserver = new URLObserver();
  const planner = new Planner();

  // initialise components, already do it now to trigger map loading asap
  const navigation = new Navigation();
  const components = {
    map: new MapWrapper("map", urlParams.center, urlParams.zoom),
    config: new Config(document.querySelector("#config")),
    calendar: new CalendarWrapper(document.querySelector("travel-calendar")),
    perlschnur: new Perlschnur(document.querySelector("#perlschnur")),
  };

  // nothing in form is filled out -> show landing page
  // wait until user clicks the "Try it out!" button
  // this also automatically closes the landing page
  if (!urlParams.from && !urlParams.to && !urlParams.date)
    await navigation.showLandingPage();

  // landing page has been closed -> show main view
  navigation.showSidebar();
  components.map.setMapInteractive();

  urlObserver.on("urlChanged", async () => {
    await render(components, planner, parseURLParams(window.location.search));
  });

  components.config.on("submit", async (from, to, date) => {
    updateURL(from.id, to.id, date, null); // triggers re-render
  });

  components.calendar.on("connectionMoved", (newConnectionIdString) => {
    //const connectionId = ConnectionId.fromString(newConnectionIdString);
    //const connection = planner.connectionForId(connectionId);
    //const active =
    //state.replaceLegInActiveItinerary(connection);
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
  await render(components, planner, parseURLParams(window.location.search));
}
