const zIndexHiddenAlternative = 1;
const zIndexConnection = 2;
const zIndexAvailableAlternative = 3;

const calenderStartDate = new Date("2024-10-16");

// todo it would be nice if this was a constant instead of constantly being called
function getResolution() {
  const style = getComputedStyle(document.getElementById("calendar-grid"));
  const resolution = Number(style.getPropertyValue("--resolution"));
  return resolution;
}

function initCalendarGrid(container) {
  const style = getComputedStyle(container);
  const resolution = getResolution();
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

      container.appendChild(element);
    }
  }
}

function createCalenderElement(connection) {
  const resolution = getResolution();
  const rowStart = Math.round(
    timeStringToFloat(connection.startTime) * resolution,
  );
  const rowEnd = Math.round(timeStringToFloat(connection.endTime) * resolution);
  const column = differenceInDays(calenderStartDate, connection.date);

  const element = createElementFromTemplate("template-calendar-connection");
  element.id = connection.id;
  element.classList.add(connection.leg.numericId);
  element.style.gridRowStart = rowStart + 1;
  element.style.gridRowEnd = rowEnd + 1;
  element.style.gridColumn = column + 2;

  element.getElementsByClassName("connection-icon")[0].src =
    `images/${connection.type}.svg`;
  element.getElementsByClassName("connection-number")[0].innerText =
    connection.displayId;

  if (
    !connection.id.endsWith("40008503") &&
    !connection.id.endsWith("500018289")
  ) {
    element.getElementsByClassName("connection-start-time")[0].innerText =
      connection.startTime;
    element.getElementsByClassName("connection-start-station")[0].innerText =
      connection.startStation.name;
    element.getElementsByClassName("connection-end-time")[0].innerText =
      connection.endTime;
    element.getElementsByClassName("connection-end-station")[0].innerText =
      connection.endStation.name;
  }

  element.addEventListener("dragstart", (e) => {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData("calenderItemId", element.id);
    e.dataTransfer.setData("leg", connection.leg.numericId.toString());

    for (let alt of document.getElementsByClassName(
      connection.leg.numericId.toString(),
    )) {
      alt.classList.add("possibleDropTarget");
      alt.style.zIndex = zIndexAvailableAlternative;
    }
  });

  element.addEventListener("dragenter", (e) => {
    const leg = e.dataTransfer.getData("leg");
    if (!e.target.classList.contains(leg)) return;

    e.preventDefault();
    e.target.classList.add("selectedDropTarget");
  });

  element.addEventListener("dragleave", (e) => {
    const leg = e.dataTransfer.getData("leg");
    if (!e.target.classList.contains(leg)) return;

    e.preventDefault();
    e.target.classList.remove("selectedDropTarget");
  });

  element.addEventListener("dragover", (e) => {
    const leg = e.dataTransfer.getData("leg");
    if (!e.target.classList.contains(leg)) return;

    e.preventDefault(); // must do preventDefault so that drop event is fired
  });

  element.addEventListener("drop", (e) => {
    const leg = e.dataTransfer.getData("leg");
    if (!e.target.classList.contains(leg)) return;

    e.preventDefault();
    e.target.classList.remove("selectedDropTarget");

    // hide original item from calendar
    const originalCalenderItemId = e.dataTransfer.getData("calenderItemId");
    const originalCalenderItem = document.getElementById(
      originalCalenderItemId,
    );
    originalCalenderItem.classList.remove("part-of-trip");
    originalCalenderItem.classList.add("alternative");
    originalCalenderItem.draggable = false;

    for (let alt of document.getElementsByClassName(
      connection.leg.numericId.toString(),
    )) {
      alt.classList.remove("possibleDropTarget");
      alt.style.zIndex = zIndexHiddenAlternative;
    }

    // make new one visible
    e.target.classList.add("part-of-trip");
    e.target.classList.remove("alternative");
    e.target.draggable = true;
    e.target.style.zIndex = zIndexConnection;
  });

  element.addEventListener("mouseover", (e) => {
    element.classList.add("legSelected");
    map.setHover(connection.leg.numericId); // todo uses global map variable
  });

  element.addEventListener("mouseout", (e) => {
    element.classList.remove("legSelected");
    map.setNoHover(connection.leg.numericId); // todo uses global map variable
  });

  return element;
}

function displayJourneyOnCalendar(container, journey) {
  for (let connection of journey.connections) {
    const element = createCalenderElement(connection);
    element.classList.add("part-of-trip");
    element.draggable = true;
    element.style.zIndex = zIndexConnection;
    container.appendChild(element);

    const alternatives = Array.from(database.getAlternatives(connection.id));
    for (let alternative of alternatives) {
      const alternativeElement = createCalenderElement(alternative);
      alternativeElement.classList.add("alternative");
      alternativeElement.draggable = false;
      alternativeElement.style.zIndex = zIndexHiddenAlternative;
      container.appendChild(alternativeElement);
    }
  }
}
