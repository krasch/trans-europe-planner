import { CalendarWrapper } from "script/components/calendar.js";
import { Config } from "script/components/config.js";
import { MapWrapper } from "script/components/map.js";
import { Perlschnur } from "script/components/perlschnur.js";
import { MotisClient } from "script/data/sources/motis.js";
import { TravelDatabase } from "script/data/travelDatabase.js";
import { showLandingPage } from "script/landing.js";
import { main } from "script/main.js";

/**
 * for all elements, set exactly the ones in selectedNames to ".selected"
 * @param {Object.<string, Element>} elements
 * @param {string[]} selectedNames
 */
function _setSelected(elements, selectedNames) {
  for (let name in elements) {
    if (selectedNames.includes(name)) elements[name].classList.add("selected");
    else elements[name].classList.remove("selected");
  }
}

/**
 * @param {Object.<string, Element>} tabs
 * @param {Object.<string, Element>} content
 * @param {HTMLElement} mainContainer
 */
function initNavigation(tabs, content, mainContainer) {
  // initial load
  _setSelected(tabs, ["config"]);
  _setSelected(content, ["config"]);

  tabs.config.addEventListener("click", (e) => {
    _setSelected(tabs, ["config"]);
    _setSelected(content, ["config"]);
  });

  // this tab is only available on mobile
  // no content is selected because map is in background
  tabs.map.addEventListener("click", (e) => {
    _setSelected(tabs, ["map"]);
    _setSelected(content, []);
  });

  tabs.calendar.addEventListener("click", (e) => {
    _setSelected(tabs, ["calendar"]);
    _setSelected(content, ["calendar"]);
  });

  tabs.perlschnur.addEventListener("click", (e) => {
    _setSelected(tabs, ["perlschnur"]);
    _setSelected(content, ["perlschnur"]);
  });
}

export async function init() {
  const elements = {
    landing: document.querySelector("dialog"),
    main: document.querySelector("main"),
    travelCalendar: document.querySelector("travel-calendar"),

    nav: {
      map: document.querySelector("#nav-tab-map"),
      config: document.querySelector("#nav-tab-config"),
      calendar: document.querySelector("#nav-tab-calendar"),
      perlschnur: document.querySelector("#nav-tab-perlschnur"),
    },

    // items we can control using tabs
    content: {
      config: document.querySelector("#config"),
      calendar: document.querySelector("#calendar"),
      perlschnur: document.querySelector("#perlschnur"),
    },
  };

  initNavigation(elements.nav, elements.content, elements.main);

  const isMobile = window.matchMedia("(max-width: 1000px)");
  let defaultZoom = 7.3;
  if (isMobile.matches) defaultZoom = 3.3;

  // map is initially in non-interactive mode with reduced opacity (to be a nice background image basically)
  // this already starts loading the map while we do other stuff
  const map = new MapWrapper("map", [11.75685, 54.0443], defaultZoom);

  // also create all the other components (less to do for them)
  const components = {
    mainContainer: elements.main, // todo a component, just an HTML element
    map: map,
    config: new Config(elements.content.config),
    calendar: new CalendarWrapper(elements.travelCalendar), // sic
    perlschnur: new Perlschnur(elements.content.perlschnur),
  };

  // show the <main> element
  // elements.main.classList.remove("closed");

  // currently hard-code using motis
  const motis = new MotisClient();
  const travelDatabase = new TravelDatabase(motis);

  // temporary: always show side bar
  components.mainContainer.classList.remove("no-journey");

  await main(components, travelDatabase);
}
