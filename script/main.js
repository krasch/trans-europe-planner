import {
  prepareInitialDataForMap,
  prepareDataForMap,
} from "./data/components/map.js";
import { ItineraryCollection } from "./types/itineraryCollection.js";
import { prepareDataForCalendar } from "./data/components/calendar.js";
import { prepareDataForPerlschnur } from "./data/components/perlschnur.js";

async function updateAllComponents(components, travelDatabase, state) {
  // alternatives for all the connections in current active itinerary - needed for calendar
  const alternatives = await travelDatabase.getAlternatives(
    state.itineraries.active,
    state.date,
  );

  // update map
  const mapData = prepareDataForMap(state.itineraries);
  components.map.updateView(mapData);

  // update calendar
  const calendarData = prepareDataForCalendar(
    state.itineraries.active,
    alternatives,
  );
  components.calendar.updateView(state.date, calendarData);

  // update perlschnur
  const perlschnurData = prepareDataForPerlschnur(state.itineraries.active);
  components.perlschnur.updateView(perlschnurData);

  // make calendar/perlschnur visible if there is an active journey
  if (state.itineraries.hasActive)
    components.mainContainer.classList.remove("no-journey");
  else components.mainContainer.classList.add("no-journey");
}

export async function main(home, components, travelDatabase) {
  // init state
  const state = {
    home: home,
    date: components.datepicker.currentDate,
    itineraries: new ItineraryCollection(),
  };

  // prepare all geo etc data that map needs
  const initialMapData = prepareInitialDataForMap(
    state.home,
    travelDatabase.geoDatabase.geoDataForAllCities,
  );

  // and add that data to the map
  components.map.initMapData(initialMapData);

  // partial function for conveniently updating the components
  const updateComponents = updateAllComponents.bind(
    null, // sic
    components,
    travelDatabase,
  );

  // moving things around in the calendar
  components.calendar.on("legChanged", async (leg, newConnectionId) => {
    const connection = travelDatabase.getCachedConnection(newConnectionId);

    state.itineraries.active.replaceLeg(leg, connection);
    await updateComponents(state);
  });

  components.map.on("selectJourney", async (journeyId) => {
    state.itineraries.setActive(journeyId);
    await updateComponents(state);
  });

  components.map.on("showCityRoutes", async (cityId) => {
    const itineraries = await travelDatabase.plan(
      state.home,
      cityId,
      state.date,
    );

    state.itineraries.replaceAll(itineraries);
    state.itineraries.setActive(itineraries[0].id); // todo which one to choose?
    await updateComponents(state);
  });

  components.calendar.on("legHoverStart", (leg) => {
    components.map.setLegHoverState(leg, true);
  });

  components.calendar.on("legHoverStop", (leg) =>
    components.map.setLegHoverState(leg, false),
  );

  components.datepicker.on("dateChanged", async (date) => {
    /*const diff = diffDays(state.date, date);
    if (diff === 0) return;

    state.itineraries.shiftDate(diff, geoDatabase);
    state.date = date;

    await updateComponents(state);*/
  });

  // trigger initial update
  await updateComponents(state);
}
