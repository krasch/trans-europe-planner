import { prepareDataForCalendar } from "app/components/_data/calendar.js";
import { prepareDataForMap } from "app/components/_data/map.js";
import { prepareDataForPerlschnur } from "app/components/_data/perlschnur.js";
import { CalendarWrapper } from "app/components/calendar.js";
import { Config } from "app/components/config.js";
import { MapWrapper } from "app/components/map.js";
import { Perlschnur } from "app/components/perlschnur.js";
// todo should all come from planner
import { getStopInfo } from "app/data/motis/client.js";
import { Planner } from "app/data/planner/planner.js";
import { Connection } from "app/types/connection.js";
import { DateTime } from "app/types/dateTime.js";
import { Itinerary } from "app/types/itinerary.js";
import { Stop } from "app/types/stop.js";
import { setURLState } from "app/url.js";

/**
 * @typedef {import("app/url.js").ParsedURLData} ParsedURLData
 */

/**
 * @param {Config} config
 * @param {Stop} [from]
 * @param {Stop} [to]
 * @param {DateTime} [date]
 */
function renderConfig(config, from, to, date) {
  config.updateView(from?.name, to?.name, date);
}

/**
 * @param {Perlschnur} perlschnur
 * @param {Itinerary} active
 */
function renderPerlschnur(perlschnur, active) {
  const data = prepareDataForPerlschnur(active);
  perlschnur.updateView(data);
}

/**
 * @param {MapWrapper} map
 * @param {Itinerary} active
 * @param {Itinerary[]} alternatives
 */
async function renderMap(map, active, alternatives) {
  const data = prepareDataForMap(active, alternatives);
  await map.updateView(data);
}

/**
 * @param {CalendarWrapper} calendar
 * @param {Itinerary} active
 * @param {DateTime} startDate
 */
function initRenderCalendar(calendar, active, startDate) {
  /**
   * @param {Connection[][]} alternatives
   */
  function render(alternatives) {
    const calendarData = prepareDataForCalendar(active, alternatives);
    calendar.updateView(startDate.toISODate(), calendarData);
  }
  return render;
}

/**
 * @param {Object.<string,any>} components
 * @param {Planner} planner
 * @param {ParsedURLData} urlState
 */
export async function render(components, planner, urlState) {
  let from = null;
  if (urlState.from) from = await getStopInfo(urlState.from);

  let to = null;
  if (urlState.to) to = await getStopInfo(urlState.to);

  // update config form
  renderConfig(components.config, from, to, urlState.calendarStartDate);

  // form is not fully filled out -> nothing else to render
  if (!from || !to || !urlState.calendarStartDate) return;

  // currently no active itinerary
  // -> run planning and pick an itinerary from the results
  if (urlState.active.length === 0) {
    const itineraries = await planner.plan(
      from.id,
      to.id,
      urlState.calendarStartDate,
    );
    const active = itineraries[0];
    const alternatives = itineraries.slice(1);

    // this will trigger an event which will trigger another round of render()
    // during that render we will gather all that other data we need
    setURLState(
      urlState.from,
      urlState.to,
      urlState.calendarStartDate,
      active.connectionIds,
      alternatives.map((a) => a.connectionIds),
    );
    return;
  }

  // this turns on the loading circle in submit button
  components.config.lock();

  // gather all the data for the active itinerary - need to await because everybody needs this
  const active = await planner.itineraryForIds(
    urlState.active,
    urlState.calendarStartDate,
  );

  // we also need to gather all the data for the alternative itineraries
  // but since only the map needs it, we don't await
  const mapAlternativesPromises = urlState.alternatives.map((alt) =>
    planner.itineraryForIds(alt, urlState.calendarStartDate),
  );

  // as soon as all the alternative itineraries are ready, we can draw the map
  // we can then also turn of the main loading circle
  // (the calendar events have their own loading circle so don't need the big one while loading them)
  Promise.all(mapAlternativesPromises).then(async (mapAlternatives) => {
    await renderMap(components.map, active, mapAlternatives);
    components.config.unlock();
  });

  // perlschnur can be rendered without extra data
  renderPerlschnur(components.perlschnur, active);

  // for calendar, we prepare a list [null, null, ...] with length = num connections in active itinerary
  // null = no alternatives available yet for this connection = show this connection in calendar with spinny wheel
  const calendarAlternatives = active.connections.map(() => null);

  // we initialise calendar rendering with the parameters that are always the same
  // (otherwise the lines get so long)
  const renderCalendar = initRenderCalendar(
    components.calendar,
    active,
    urlState.calendarStartDate,
  );

  // we start by rendering the calendar with all alternatives = null -> all connections having a spinny wheel
  renderCalendar(calendarAlternatives);
  components.navigation.focusComponent("calendar");

  // then we load all the alternative and as soon as any are ready, we redraw the calendar, now with fewer spinny wheels
  active.connections.forEach((connection, i) => {
    planner
      .alternativeConnections(connection, urlState.calendarStartDate)
      .then((alternativesForConnection) => {
        calendarAlternatives[i] = alternativesForConnection;
        renderCalendar(calendarAlternatives);
      });
  });

  // todo this function is not actually awaitable :-(
}
