import { CalendarWrapper } from "app/components/calendar.js";
import { Config } from "app/components/config.js";
import { MapWrapper } from "app/components/map.js";
import { Perlschnur } from "app/components/perlschnur.js";
import { main } from "app/main.js";
import { Planner } from "app/planner.js";
import { DateTime } from "app/types/dateTime.js";

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

/**
 * @param {HTMLDialogElement} modal
 */
async function showLandingPage(modal) {
  // using form with submit = "dialog"
  // submit -> automatically closes -> resolves
  const modalClosedPromise = new Promise((resolve) =>
    modal.addEventListener("close", (e) => {
      resolve();
    }),
  );

  modal.show();

  return modalClosedPromise;
}

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
  await showLandingPage(elements.landing);

  // show the <main> element
  elements.main.classList.remove("closed");
  components.map.setMapInteractive();

  const planner = new Planner();
  await main(components, planner);
}
