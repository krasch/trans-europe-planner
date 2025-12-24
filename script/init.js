import { CalendarWrapper } from "script/components/calendar.js";
import { Datepicker } from "script/components/datepicker.js";
import { showLandingPage } from "script/components/landing.js";
import { MapWrapper } from "script/components/map.js";
import { Perlschnur } from "script/components/perlschnur.js";
import { MotisClient } from "script/data/sources/motis.js";
import { TravelDatabase } from "script/data/travelDatabase.js";
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
function initMobileNavigation(tabs, content, mainContainer) {
  // on initial load, map tab is selected and all other content is hidden
  // -> map shines through from the background
  _setSelected(tabs, ["map"]);
  _setSelected(content, []);

  // clicking on map tab -> no content is selected because map is in background
  tabs.map.addEventListener("click", (e) => {
    _setSelected(tabs, ["map"]);
    _setSelected(content, []); // must do this to unselect all content
  });

  // clicking on calendar tab -> show container journey element and its child calendar element
  tabs.calendar.addEventListener("click", (e) => {
    if (mainContainer.classList.contains("no-journey")) return;
    _setSelected(tabs, ["calendar"]);
    _setSelected(content, ["journey", "calendar"]);
  });

  // clicking on summary tab -> show container journey element and its child summary element
  tabs.summary.addEventListener("click", (e) => {
    if (mainContainer.classList.contains("no-journey")) return;
    _setSelected(tabs, ["summary"]);
    _setSelected(content, ["journey", "summary"]);
  });

  // clicking on config tab -> just show config
  tabs.config.addEventListener("click", (e) => {
    if (mainContainer.classList.contains("no-journey")) return;
    _setSelected(tabs, ["config"]);
    _setSelected(content, ["config"]);
  });
}

/**
 * @param {Object.<string, Element>} tabs
 * @param {Object.<string, Element>} content
 */
function initDesktopNavigation(tabs, content) {
  // on desktop we only need to pick between calendar and summary
  // the config and the journey container are always shown

  // within the journey container, on first load show the calendar tab
  _setSelected(tabs, ["calendar"]);
  _setSelected(content, ["calendar"]);

  // clicking on calendar tab -> show calendar element in journey container
  tabs.calendar.addEventListener("click", (e) => {
    _setSelected(tabs, ["calendar"]);
    _setSelected(content, ["calendar"]);
  });

  // clicking on summary tab -> show summary element in journey container
  tabs.summary.addEventListener("click", (e) => {
    _setSelected(tabs, ["summary"]);
    _setSelected(content, ["summary"]);
  });
}

export async function init() {
  const elements = {
    landing: document.querySelector("dialog"),
    main: document.querySelector("main"),
    travelCalendar: document.querySelector("travel-calendar"),

    navMobile: {
      map: document.querySelector("#nav-mobile-tab-map"),
      calendar: document.querySelector("#nav-mobile-tab-calendar"),
      summary: document.querySelector("#nav-mobile-tab-summary"),
      config: document.querySelector("#nav-mobile-tab-config"),
    },
    navDesktop: {
      calendar: document.querySelector("#nav-desktop-tab-calendar"),
      summary: document.querySelector("#nav-desktop-tab-summary"),
    },

    // items we can control using tabs
    tabContents: {
      journey: document.querySelector("#journey"),
      calendar: document.querySelector("#calendar"),
      summary: document.querySelector("#summary"),
      config: document.querySelector("#config"),
    },
  };

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
    calendar: new CalendarWrapper(elements.travelCalendar),
    perlschnur: new Perlschnur(elements.tabContents.summary),
    datepicker: new Datepicker(elements.tabContents.config),
  };

  // init both navigations, CSS will pick which navigation is being shown
  initMobileNavigation(elements.navMobile, elements.tabContents, elements.main);
  initDesktopNavigation(elements.navDesktop, elements.tabContents);

  // show the <main> element
  elements.main.classList.remove("closed");

  // currently hard-code using motis
  const motis = new MotisClient();
  const travelDatabase = new TravelDatabase(motis);

  await main(components, travelDatabase);
}
