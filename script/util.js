function createElementFromTemplate(templateId, templateData) {
  const template = document.getElementById(templateId);

  // create new element by cloning template
  const element = template.content.firstElementChild.cloneNode(true);

  // fill in data
  updateElement(element, templateData);

  return element;
}

function updateElement(container, data) {
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
