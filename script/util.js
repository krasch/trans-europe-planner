export function createElementFromTemplate(templateId, templateData) {
  const template = document.getElementById(templateId);

  // create new element by cloning template
  const element = template.content.firstElementChild.cloneNode(true);

  // fill in data
  updateElement(element, templateData);

  return element;
}

export function updateElement(container, data) {
  for (let selector in data) {
    const matches =
      selector === "$root$"
        ? [container]
        : container.querySelectorAll(selector);

    for (let element of matches) {
      for (let key in data[selector]) {
        if (key.startsWith("data"))
          element.setAttribute(key, data[selector][key]);
        else element[key] = data[selector][key];
      }
    }
  }
}

// backup colors (mostly for tests)
let CONNECTION_COLORS = [
  "0, 255, 0",
  "255, 0, 0",
  "0, 0, 255",
  "255, 255, 0",
  "255, 0, 255",
];

export function initColors() {
  const body = document.getElementsByTagName("body")[0];
  const style = getComputedStyle(body);

  CONNECTION_COLORS = [
    style.getPropertyValue("--color1"),
    style.getPropertyValue("--color2"),
    style.getPropertyValue("--color3"),
    style.getPropertyValue("--color4"),
    style.getPropertyValue("--color5"),
  ];
}

export function getColor(i) {
  return CONNECTION_COLORS[i % CONNECTION_COLORS.length];
}

export let CITY_NAME_TO_ID = {};

export function initCityNameToId(cities) {
  for (let id in cities) CITY_NAME_TO_ID[cities[id].name] = String(id);
}

export function sortConnectionsByDepartureTime(connections) {
  connections.sort(
    (c1, c2) => c1.departure.toMillis() - c2.departure.toMillis(),
  );
}
