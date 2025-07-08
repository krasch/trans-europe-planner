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

export function groupBy(array, keyFn) {
  const grouped = {};

  for (let entry of array) {
    const key = keyFn(entry);

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  }

  return grouped;
}
