import { CalendarWrapper } from "app/components/calendar.js";
import { Config } from "app/components/config.js";
import { MapWrapper } from "app/components/map.js";
import {
  initNavigation,
  showLandingPage,
  showSidebar,
} from "app/components/nav.js";
import { Perlschnur } from "app/components/perlschnur.js";
import { main } from "app/main.js";
import { Planner } from "app/planner.js";
import { DateTime } from "app/types/dateTime.js";

export async function init() {
  const isMobile = window.matchMedia("(max-width: 1000px)");

  const today = DateTime.now().startOf("day");
  const calendarMin = today;
  const calendarMax = today.plus({ days: 3 * 30 });
  const calendarInitialDate = today.plus({ days: 30 });

  let zoom = 7.3;
  if (isMobile.matches) zoom = 5.3;
  const mapCenter = [11.75685, 54.0443];

  const elements = {
    main: document.querySelector("main"),
    travelCalendar: document.querySelector("travel-calendar"),

    // items we can control using tabs
    content: {
      config: document.querySelector("#config"),
      calendar: document.querySelector("#calendar"),
      perlschnur: document.querySelector("#perlschnur"),
    },
  };

  initNavigation();

  // map is initially in non-interactive mode with reduced opacity (to be a nice background image basically)
  // this already starts loading the map while we do other stuff
  const map = new MapWrapper("map", mapCenter, zoom);

  // also create all the other components
  const components = {
    mainContainer: elements.main, // todo a component, just an HTML element
    map: map,
    config: new Config(elements.content.config, calendarMin, calendarMax),
    calendar: new CalendarWrapper(elements.travelCalendar), // sic
    perlschnur: new Perlschnur(elements.content.perlschnur),
  };

  // set initial values
  components.config.date = calendarInitialDate;

  // show landing page
  // wait until user clicks the "Try it out!" button
  // this also automatically closes the landing page
  await showLandingPage();

  showSidebar();
  components.map.setMapInteractive();

  const planner = new Planner();
  await main(components, planner);
}
