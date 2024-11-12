function createElementFromTemplate(templateId, templateData) {
  const template = document.getElementById(templateId);

  // create new element by cloning template
  const element = template.content.firstElementChild.cloneNode(true);

  // fill in data
  for (let selector in templateData) {
    const children = element.querySelectorAll(selector);

    for (let child of children) {
      for (let key in templateData[selector]) {
        child[key] = templateData[selector][key];
      }
    }
  }

  return element;
}
