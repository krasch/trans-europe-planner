/**
 * @param {string} templateId
 * @param {Object<string, object>} templateData
 */
export function createElementFromTemplate(templateId, templateData) {
  const template = document.getElementById(templateId);

  // create new element by cloning template
  // @ts-expect-error TS2339
  const element = template.content.firstElementChild.cloneNode(true);

  // fill in data
  updateElement(element, templateData);

  return element;
}

/**
 *
 * @param {Element} container
 * @param {Object<string, object>} data
 */
export function updateElement(container, data) {
  for (let selector in data) {
    let matches = null;

    // we are changing the root element (the container itself)
    if (selector === ".") matches = [container];
    // we are changing children of the container
    else matches = container.querySelectorAll(selector);

    for (let [key, value] of Object.entries(data[selector])) {
      // updating dataset, should be "data-key:value"
      if (key.startsWith("data"))
        matches.forEach((e) => e.setAttribute(key, value));
      // updating everything else
      else matches.forEach((e) => (e[key] = value));
    }
  }
}
