function createElementFromTemplate(templateId){

    const template = document.getElementById(templateId);

    // create new element by cloning template
    const element = template.content.firstElementChild.cloneNode(true);

    return element;
}