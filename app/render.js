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

  // we have trip ids in the url -> need to gather the data to build itinerary
  components.config.lock();

  const active = await planner.itineraryForIds(
    urlState.active,
    urlState.calendarStartDate,
  );

  // alternatives for all the connections in current active itinerary - needed for calendar
  const activeAlternatives = await planner.allAlternativeConnections(
    active,
    urlState.calendarStartDate,
  );

  // all alternative georoutes - needed for map
  const alternativeItineraries = await Promise.all(
    urlState.alternatives.map((alt) =>
      planner.itineraryForIds(alt, urlState.calendarStartDate),
    ),
  );

  // todo trigger loading alternative connections for alternative routes

  // update map
  const mapData = prepareDataForMap(active, alternativeItineraries);
  components.map.updateView(mapData);

  // update calendar
  const calendarData = prepareDataForCalendar(active, activeAlternatives);
  components.calendar.updateView(
    urlState.calendarStartDate.toISODate(),
    calendarData,
  );

  // update perlschnur
  const perlschnurData = prepareDataForPerlschnur(active);
  components.perlschnur.updateView(perlschnurData);

  // todo can probably unlock earlier
  components.config.unlock();
}
