import { MapWrapper } from "./components/map/map.js";
import { showLandingPage } from "./components/landing.js";

const HOMES = ["Berlin", "Hamburg", "Köln", "München", "Stockholm"];

function parseURLParams() {
  const params = new URLSearchParams(window.location.search);
  const home = params.get("start");

  if (home && HOMES.includes(home)) return home;

  return null;
}

export async function init() {
  // map is initially in non-interactive mode with reduced opacity (to be a nice background image basically)
  const map = new MapWrapper("map", [10.0821932, 49.786322], 4.3);

  // home can be passed as URL parameter, e.g. ?start=Berlin
  let home = parseURLParams();

  // if it was not, show landing page and ask user for home
  if (!home) home = await showLandingPage(document.querySelector("dialog"));

  // now we actually need the map, so wait until the load event has been fired
  await map.loaded;

  // increases map opacity and enables the usual map controls
  map.enableMapInteraction();

  console.log(home);
}
