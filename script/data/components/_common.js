export const ICONS = {
  train: "images/icons/train.svg",
  ferry: "images/icons/ferry.svg",
  REGIONAL_RAIL: "images/icons/train.svg",
};

// will be loaded first time we need colors
// can not immediately read the colors here because during testing the HTML document is not available at this point yet
let COLORS = null;

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

  const color = COLORS[idx % COLORS.length];
  return color;
}

function toAlphabeticEdgeString(start, end) {
  if (start < end) return `${start}->${end}`;
  else return `${end}->${start}`;
}

// important that all components use the same identifiers for each bit of data
// todo move this back into classes? but then how to deal with edge during initial map data?
export const identifiers = {
  city: (stop) => stop.city.id,
  edge: (edge) => toAlphabeticEdgeString(edge.from.city.id, edge.to.city.id),
  leg: (connection) => `${connection.from.city.id}->${connection.to.city.id}`,
  connection: (connection) => connection.id,
  itinerary: (itinerary) => itinerary.id,
};
