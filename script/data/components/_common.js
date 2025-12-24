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
// can not immediately read the colors here because during testing the HTML
// document is not available at this point yet
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
