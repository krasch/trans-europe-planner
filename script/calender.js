function instantiateHourlyGridTemplate(hour) {
    const template = document.getElementById('template-hourly-grid');

    // create new element by cloning template
    const element = template.content.firstElementChild.cloneNode(true);

    // fill element attributes
    element.innerText = `${hour}`.padStart(2, '0');

    return element;
}

function instantiateConnectionGridTemplate(id, connection) {
    const template = document.getElementById('template-connection-grid');

    // create new element by cloning template
    const element = template.content.firstElementChild.cloneNode(true);

    const resolution = 2;
    const rowStart = Math.round(connection.start * resolution)
    const rowEnd = Math.round(connection.end * resolution)

    // fill element attributes
    element.id = id;
    element.innerText = connection.title;
    element.style.setProperty('grid-row-start', rowStart + 1);
    element.style.setProperty('grid-row-end', rowEnd + 1);
    element.style.setProperty('grid-column', 1);

    if (id === "1"){
        element.style.setProperty('background-color', "blue");
    }

    element.addEventListener("dragstart", e => {
        e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData("connectionId", e.target.id);
    });

    element.addEventListener("drop", e => {
        e.preventDefault();
        const connectionId = e.dataTransfer.getData("connectionId");
        const connectionDiv = document.getElementById(connectionId);

        const connectionLength = connectionDiv.style.gridRowEnd - connectionDiv.style.gridRowStart;

        connectionDiv.style.gridRowStart = e.target.style.gridRowStart;
        connectionDiv.style.gridRowEnd = Number(e.target.style.gridRowStart) + connectionLength;
        connectionDiv.style.zIndex = "2";

    });

    element.addEventListener("dragover", e => {
        e.preventDefault();
    });

    return element

}

function initHourlyGrid(container) {
    for (let hour = 0; hour < 24; hour++) {
        container.appendChild(instantiateHourlyGridTemplate(hour));
    }
}

function displayConnections(container, connections) {
    for (let i in connections) {
        container.appendChild(instantiateConnectionGridTemplate(i, connections[i]))
    }
}
