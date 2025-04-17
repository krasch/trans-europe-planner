import { MapWrapper } from "./components/map/map.js";
import { showLandingPage } from "./components/landing.js";

const HOMES = ["Berlin", "Hamburg", "Köln", "München", "Stockholm"];

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  const home = params.get("start");

  if (home && HOMES.includes(home)) return home;

  return null;
}

function _setSelected(elements, selectedNames) {
  /* for all elements, set exactly the ones in selectedNames to ".selected" */
  for (let name in elements) {
    if (selectedNames.includes(name)) elements[name].classList.add("selected");
    else elements[name].classList.remove("selected");
  }
}

function initMobileNavigation(tabs, content) {
  console.log(content);

  // on initial load, map tab is selected and all other content is hidden
  // -> map shines through from the background
  _setSelected(tabs, ["map"]);
  _setSelected(content, []);
  console.log(content);

  // clicking on map tab -> no content is selected because map is in background
  tabs.map.addEventListener("click", (e) => {
    _setSelected(tabs, ["map"]);
    _setSelected(content, []); // must do this to unselect all content
  });

  // clicking on calendar tab -> show container journey element and its child calendar element
  tabs.calendar.addEventListener("click", (e) => {
    _setSelected(tabs, ["calendar"]);
    _setSelected(content, ["journey", "calendar"]);
  });

  // clicking on summary tab -> show container journey element and its child summary element
  tabs.summary.addEventListener("click", (e) => {
    _setSelected(tabs, ["summary"]);
    _setSelected(content, ["journey", "summary"]);
  });

  // clicking on config tab -> just show config
  tabs.config.addEventListener("click", (e) => {
    _setSelected(tabs, ["config"]);
    _setSelected(content, ["config"]);
  });
}

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
    content: {
      journey: document.querySelector("#journey"),
      calendar: document.querySelector("#calendar"),
      summary: document.querySelector("#summary"),
      config: document.querySelector("#config"),
    },
    navTabsMobile: {
      map: document.querySelector("#nav-mobile-tab-map"),
      calendar: document.querySelector("#nav-mobile-tab-calendar"),
      summary: document.querySelector("#nav-mobile-tab-summary"),
      config: document.querySelector("#nav-mobile-tab-config"),
    },
    navTabsDesktop: {
      calendar: document.querySelector("#nav-desktop-tab-calendar"),
      summary: document.querySelector("#nav-desktop-tab-summary"),
    },
  };

  // map is initially in non-interactive mode with reduced opacity (to be a nice background image basically)
  const map = new MapWrapper("map", [10.0821932, 49.786322], 4.3);

  // home can be passed as URL parameter, e.g. ?start=Berlin
  let home = parseURLParams();

  // if it was not, show landing page and ask user for home
  // (landing page dialog closes automatically when user clicks submit button)
  if (!home) home = await showLandingPage(elements.landing);

  // init both navigations, CSS will pick which navigation is being shown
  initMobileNavigation(elements.navTabsMobile, elements.content);
  initDesktopNavigation(elements.navTabsDesktop, elements.content);

  // show the main page
  elements.main.classList.remove("closed");

  // now we actually need the map, so wait until the load event has been fired
  await map.loaded;

  // increases map opacity and enables the usual map controls
  map.enableMapInteraction();

  console.log(home);
}
