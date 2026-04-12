import { prepareDataForCalendar } from "app/components/_data/calendar.js";
import { prepareDataForMap } from "app/components/_data/map.js";
import { prepareDataForPerlschnur } from "app/components/_data/perlschnur.js";
// todo should all come from planner
import { getStopInfo } from "app/data/motis/client.js";
import { Planner } from "app/data/planner/planner.js";
import { setURLState } from "app/url.js";

/**
 * @typedef {import("app/url.js").ParsedURLData} ParsedURLData
 */

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
  components.config.updateView(
    from?.name,
    to?.name,
    urlState.calendarStartDate,
  );

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
  const alternativesPromises = urlState.alternatives.map((alt) =>
    planner.itineraryForIds(alt, urlState.calendarStartDate),
  );

  // as soon as all the alternative itineraries are ready, we can draw the map
  Promise.all(alternativesPromises).then((alternatives) => {
    const mapData = prepareDataForMap(active, alternatives);
    components.map.updateView(mapData);

    // we can now also turn of the loading circle
    // (the calendar events have their own loading circle so don't need the big one while loading them)
    components.config.unlock();
  });

  // draw the perlschnur
  const perlschnurData = prepareDataForPerlschnur(active);
  components.perlschnur.updateView(perlschnurData);

  // for calendar, we prepare a list [null, null, ...] with length = num connections in active itinerary
  // null = no alternatives available yet for this connection = show this connection in calendar with spinny wheel
  const activeAlternatives = active.connections.map(() => null);
  const renderCalendar = () => {
    const calendarData = prepareDataForCalendar(active, activeAlternatives);
    components.calendar.updateView(
      urlState.calendarStartDate.toISODate(),
      calendarData,
    );
  };

  // we start by rendering the calendar with all connections having a spinny wheel
  // then we load all the alternative and as soon as any are ready, we redraw the calendar, now with fewer spinny wheels
  renderCalendar();
  components.navigation.focusComponent("calendar");
  active.connections.forEach((connection, i) => {
    planner
      .alternativeConnections(connection, urlState.calendarStartDate)
      .then((alternativesForConnection) => {
        activeAlternatives[i] = alternativesForConnection;
        renderCalendar();
      });
  });

  // todo this function is not actually awaitable :-(
}
