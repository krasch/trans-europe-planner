let currentHoverLine = null;

const calenderStartDate = new Date("2023-10-16");

function initCalendarGrid(container) {
  const style = getComputedStyle(container);
  const resolution = Number(style.getPropertyValue("--resolution"));
  const numDays = Number(style.getPropertyValue("--num-days"));

  /* hour label on left side of calendar */
  for (let hour = 0; hour < 24; hour++) {
    const element = createElementFromTemplate("template-calendar-grid-hour");

    element.style.gridRowStart = hour * resolution + 1;
    element.style.gridRowEnd = (hour + 1) * resolution + 1;
    element.style.gridColumn = 1;
    //element.style.background = "blue";

    element.innerText = `${hour}`.padStart(2, "0");

    container.appendChild(element);
  }

  /* empty calender cells */
  for (let day = 0; day < numDays; day++) {
    for (let i = 0; i < 24 * resolution; i++) {
      const element = createElementFromTemplate("template-calendar-grid-cell");
      element.id = `calender-cell-${day}-${i}`;
      element.style.gridRowStart = i + 1;
      element.style.gridRowEnd = i + 1 + 1;
      element.style.gridColumn = day + 2; // column1 = hour labels

      //element.style.background = "green";

      element.addEventListener("drop", (e) => {
        e.preventDefault(); // todo check for event type

        const connectionId = e.dataTransfer.getData("trainId");
        const connectionDiv = document.getElementById(connectionId);

        const connectionLength =
          connectionDiv.style.gridRowEnd - connectionDiv.style.gridRowStart;

        connectionDiv.style.gridRowStart = e.target.style.gridRowStart;
        connectionDiv.style.gridRowEnd =
          Number(e.target.style.gridRowStart) + connectionLength;
        connectionDiv.style.gridColumn = e.target.style.gridColumn;

        if (currentHoverLine) {
          currentHoverLine.classList.remove("possibleDropTarget");
          currentHoverLine = null;
        }
      });

      element.addEventListener("dragover", (e) => {
        e.preventDefault(); // todo check for event type

        if (currentHoverLine) {
          currentHoverLine.classList.remove("possibleDropTarget");
        }

        currentHoverLine = e.target;
        currentHoverLine.classList.add("possibleDropTarget");
      });

      container.appendChild(element);
    }
  }
}

function displayRouteOnCalender(container, route) {
  const style = getComputedStyle(container);
  const resolution = Number(style.getPropertyValue("--resolution"));

  for (let train of route.trains) {
    const rowStart = Math.round(
      timeStringToFloat(train.startTime) * resolution,
    );
    const rowEnd = Math.round(timeStringToFloat(train.endTime) * resolution);
    const column = differenceInDays(calenderStartDate, train.date);

    const element = createElementFromTemplate("template-calendar-connection");
    element.id = `route${train.id}`;
    element.style.gridRowStart = rowStart + 1;
    element.style.gridRowEnd = rowEnd + 1;
    element.style.gridColumn = column + 2;

    element.getElementsByClassName("connection-icon")[0].src =
      `images/${train.type}.svg`;
    element.getElementsByClassName("connection-number")[0].innerText =
      train.name;

    if (train.id !== 40008503 && train.id !== 500018289) {
      element.getElementsByClassName("connection-start-time")[0].innerText =
        train.startTime;
      element.getElementsByClassName("connection-start-station")[0].innerText =
        train.startStation.name;
      element.getElementsByClassName("connection-end-time")[0].innerText =
        train.endTime;
      element.getElementsByClassName("connection-end-station")[0].innerText =
        train.endStation.name;
    }

    element.addEventListener("dragstart", (e) => {
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.setData("trainId", element.id);
    });

    element.addEventListener("mouseover", (e) => {
      element.classList.add("routeSelected");
      setHover(map, train.id); // todo uses global map variable
    });

    element.addEventListener("mouseout", (e) => {
      element.classList.remove("routeSelected");
      setNoHover(map, train.id); // todo uses global map variable
    });

    container.appendChild(element);
  }
}
