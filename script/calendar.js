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

    if (id === "1") {
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

function initCalendarGrid(container) {
    const style = getComputedStyle(container);
    const resolution = Number(style.getPropertyValue('--resolution'));
    const numDays = Number(style.getPropertyValue('--num-days'));

    /* hour label on left side of calendar */
    for (let hour = 0; hour < 24; hour++) {
        const e = createElementFromTemplate("template-calendar-grid-label");

        e.style.gridRowStart = hour * resolution + 1;
        e.style.gridRowEnd =  (hour + 1) * resolution + 1;
        //e.style.background = "blue";

        e.innerText = `${hour}`.padStart(2, '0');

        container.appendChild(e);
    }

    /* empty calender cells */
    for (let i = 0; i < 24 * resolution * numDays; i++) {
        const e = createElementFromTemplate("template-calendar-grid-cell");
        //e.style.background = "green";

        container.appendChild(e);
    }
}

function displayConnections(container, connections) {
    const style = getComputedStyle(container);
    const resolution = Number(style.getPropertyValue('--resolution'));

    for (let i in connections) {
        const connection = connections[i];

        const rowStart = Math.round(connection.start * resolution)
        const rowEnd = Math.round(connection.end * resolution)

        const e = createElementFromTemplate("template-calendar-connection");
        e.id = i;
        e.innerText = connection.title;
        e.style.gridRowStart = rowStart + 1;
        e.style.gridRowEnd = rowEnd + 1;
        e.style.gridColumn = 2;
        e.style.background = "red";

        container.appendChild(e);
    }
}
