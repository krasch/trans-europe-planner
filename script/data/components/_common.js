import { Connection } from "script/types/connection.js";
import { Itinerary } from "script/types/itinerary.js";
import { Stop } from "script/types/stop.js";

/**
 * @type {Object.<string,string>}
 */
export const ICONS = {
  train: "images/icons/train.svg",
  ferry: "images/icons/ferry.svg",
  REGIONAL_RAIL: "images/icons/train.svg",
};

export const GREY = "#aaa";

// will be loaded first time we need colors
// can not immediately read the colors here because during testing the HTML document is not available at this point yet
let COLORS = null;

/**
 * @param {number} idx
 * @returns {string}
 */
export function getColor(idx) {
  if (COLORS === null) {
    const body = document.getElementsByTagName("body")[0];
    const style = getComputedStyle(body);

    COLORS = [
      style.getPropertyValue("--color1"),
      style.getPropertyValue("--color2"),
      style.getPropertyValue("--color3"),
      style.getPropertyValue("--color4"),
      style.getPropertyValue("--color5"),
    ];
  }

  return COLORS[idx % COLORS.length];
}

/**
 * @param {string} start
 * @param {string} end
 */
export function toAlphabeticEdgeString(start, end) {
  if (start < end) return `${start}->${end}`;
  else return `${end}->${start}`;
}

// important that all components use the same identifiers for each bit of data
// todo move this back into classes? but then how to deal with edge during initial map data?
export const identifiers = {
  city: (/** @type {Stop} */ stop) => stop.city.id,
  edge: (edge) => toAlphabeticEdgeString(edge.from.city.id, edge.to.city.id), // todo type annotation
  leg: (/** @type {Connection} */ connection) =>
    `${connection.from.city.id}->${connection.to.city.id}`,

  /**
   * @param {Connection} connection
   * @returns {string}
   */
  connection: (connection) => connection.id,

  itinerary: (/** @type {Itinerary} */ itinerary) => itinerary.id,
};
