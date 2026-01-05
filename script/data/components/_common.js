/**
 * @type {Object.<string,string>}
 */
const ICONS = {
  OTHER: "images/icons/transport/empty.svg",

  BUS: "images/icons/transport/bus.svg",
  COACH: "images/icons/transport/bus.svg",

  RAIL: "images/icons/transport/rail.svg",
  HIGHSPEED_RAIL: "images/icons/transport/rail.svg",
  LONG_DISTANCE: "images/icons/transport/rail.svg",
  NIGHT_RAIL: "images/icons/transport/rail.svg",
  REGIONAL_FAST_RAIL: "images/icons/transport/rail.svg",
  REGIONAL_RAIL: "images/icons/transport/rail.svg",
  METRO: "images/icons/transport/rail.svg",
  SUBURBAN: "images/icons/transport/rail.svg",
  TRAM: "images/icons/transport/rail.svg",
  SUBWAY: "images/icons/transport/rail.svg",
  TRANSIT: "images/icons/transport/rail.svg",
};

/**
 * @param {string} mode
 * @returns {string} image path
 */
export function getIcon(mode) {
  if (ICONS[mode]) return ICONS[mode];
  else return ICONS.OTHER;
}

const body = document.getElementsByTagName("body")[0];
const style = getComputedStyle(body);

const COLORS = [
  style.getPropertyValue("--color1"),
  style.getPropertyValue("--color2"),
  style.getPropertyValue("--color3"),
  style.getPropertyValue("--color4"),
  style.getPropertyValue("--color5"),
];
export const GREY = "#aaa";

/**
 * @param {number} idx
 * @returns {string}
 */
export function getColor(idx) {
  return COLORS[idx % COLORS.length];
}
