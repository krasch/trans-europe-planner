function initCalendarGrid(container) {
    const style = getComputedStyle(container);
    const resolution = Number(style.getPropertyValue('--resolution'));
    const numDays = Number(style.getPropertyValue('--num-days'));

    /* hour label on left side of calendar */
    for (let hour = 0; hour < 24; hour++) {
        const element = createElementFromTemplate("template-calendar-grid-label");

        element.style.gridRowStart = hour * resolution + 1;
        element.style.gridRowEnd =  (hour + 1) * resolution + 1;
        element.style.gridColumn = 1;
        //element.style.background = "blue";

        element.innerText = `${hour}`.padStart(2, '0');

        container.appendChild(element);
    }

    /* empty calender cells */
    for (let day = 0; day < numDays; day ++){

        for (let i = 0; i < 24 * resolution; i++) {

            const element = createElementFromTemplate("template-calendar-grid-cell");
            element.style.gridRowStart = i+1;
            element.style.gridRowEnd = i+1+1;
            element.style.gridColumn = day+2; // column1 = hour labels

            //element.style.background = "green";

            element.addEventListener("dragover", e => {
                e.preventDefault(); // todo check for event type
            });

            element.addEventListener("drop", e => {
                e.preventDefault(); // todo check for event type
                const connectionId = e.dataTransfer.getData("connectionId");
                const connectionDiv = document.getElementById(connectionId);

                const connectionLength = connectionDiv.style.gridRowEnd - connectionDiv.style.gridRowStart;

                connectionDiv.style.gridRowStart = e.target.style.gridRowStart;
                connectionDiv.style.gridRowEnd = Number(e.target.style.gridRowStart) + connectionLength;
                connectionDiv.style.gridColumn = e.target.style.gridColumn;

            });

            container.appendChild(element);
        }

    }
}

function displayConnections(container, connections) {
    const style = getComputedStyle(container);
    const resolution = Number(style.getPropertyValue('--resolution'));

    for (let i in connections) {
        const connection = connections[i];

        const rowStart = Math.round(timeStringToFloat(connection.startTime) * resolution);
        const rowEnd = Math.round(timeStringToFloat(connection.endTime) * resolution);

        const element = createElementFromTemplate("template-calendar-connection");
        element.id = i;
        //element.innerText = connection.title;
        element.style.gridRowStart = rowStart + 1;
        element.style.gridRowEnd = rowEnd + 1;
        element.style.gridColumn = 2;

        element.getElementsByClassName("connection-number")[0].innerText = connection.trainNumber;
        element.getElementsByClassName("connection-start-time")[0].innerText = connection.startTime;
        element.getElementsByClassName("connection-start-station")[0].innerText = connection.startStation;
        element.getElementsByClassName("connection-end-time")[0].innerText = connection.endTime;
        element.getElementsByClassName("connection-end-station")[0].innerText = connection.endStation;

        element.addEventListener("dragstart", e => {
            e.dataTransfer.dropEffect = "move";
            e.dataTransfer.setData("connectionId", i);
        });

        container.appendChild(element);
    }
}
