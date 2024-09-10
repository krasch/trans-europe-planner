function instantiateHourlyGridTemplate(hour){
    const template = document.getElementById('template-hourly-grid');

    // create new element by cloning template
    const element = template.content.firstElementChild.cloneNode(true);

    // fill element attributes
    element.innerText = `${hour}`.padStart(2, '0');

    return element;
}

function instantiateConnectionGridTemplate(connection){
    const template = document.getElementById('template-connection-grid');

    // create new element by cloning template
    const element = template.content.firstElementChild.cloneNode(true);

    const resolution = 2;
    const rowStart = Math.round(connection.start * resolution)
    const rowEnd =  Math.round(connection.end * resolution)

    // fill element attributes
    element.innerText = connection.title;
    element.style.setProperty('grid-row-start', rowStart + 1);
    element.style.setProperty('grid-row-end', rowEnd + 1);

    return element

}

function initHourlyGrid(container){
    for (let hour = 0; hour < 24; hour++) {
        container.appendChild(instantiateHourlyGridTemplate(hour));
    }
}

function displayConnections(container, connections){
    for (let i in connections){
        container.appendChild(instantiateConnectionGridTemplate(connections[i]))
    }
}