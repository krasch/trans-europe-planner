class CalendarGrid {
  #onDropCallback;

  constructor(container, startDay, endDay, resolution) {
    this.container = container;
    this.startDay = startDay;
    this.endDay = endDay;
    this.resolution = resolution;
    this.numDays = 3; // todo

    this.#initHourLabels();
    this.#initEmptyCalendarCells();

    this.isValidDropTarget = (e) => {
      // only drags over a calendar entry are relevant
      if (!e.target.classList.contains("calendar-connection")) return false;

      // the "group" attributes of the element being dragged (source)
      // and the element where the mouse is currently over (target)
      const groupSource = e.dataTransfer.getData("leg");
      const groupTarget = e.target.dataset.group;

      // both group attributes must be the same
      return groupSource === groupTarget;
    };

    container.addEventListener("dragstart", (e) => {
      const leg = e.target.dataset.group;
      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.setData("leg", leg);

      // this is a group action
      for (let alt of document.getElementsByClassName(leg)) {
        alt.classList.add("possibleDropTarget");
      }
    });

    // enters a valid drop target
    container.addEventListener("dragenter", (e) => {
      if (!this.isValidDropTarget(e)) return;
      e.preventDefault();

      e.target.classList.add("selectedDropTarget");
    });

    // this event is fired every few hundred milliseconds
    container.addEventListener("dragover", (e) => {
      if (!this.isValidDropTarget(e)) return;
      e.preventDefault(); // must do preventDefault so that drop event is fired
    });

    // leaves a valid drop target
    container.addEventListener("dragleave", (e) => {
      if (!this.isValidDropTarget(e)) return;
      e.preventDefault();

      e.target.classList.remove("selectedDropTarget");
    });

    // drop: from drop target; // dragend: from dragged item
    container.addEventListener("drop", (e) => {
      if (!this.isValidDropTarget(e)) return;
      e.preventDefault();

      const leg = e.dataTransfer.getData("leg");

      // this is a group action
      for (let alt of document.getElementsByClassName(leg)) {
        alt.classList.remove("possibleDropTarget");
      }

      // hide original item from calendar -> global state, should callback
      this.#onDropCallback(leg, e.target.id);
    });
  }

  #initHourLabels() {
    for (let hour = 0; hour < 24; hour++) {
      const element = createElementFromTemplate("template-calendar-grid-hour");

      element.style.gridRowStart = hour * this.resolution + 1;
      element.style.gridRowEnd = (hour + 1) * this.resolution + 1;
      element.style.gridColumn = 1;

      element.innerText = `${hour}`.padStart(2, "0");

      this.container.appendChild(element);
    }
  }

  #initEmptyCalendarCells() {
    for (let day = 0; day < this.numDays; day++) {
      for (let i = 0; i < 24 * this.resolution; i++) {
        const element = createElementFromTemplate(
          "template-calendar-grid-cell",
        );
        element.id = `calender-cell-${day}-${i}`;
        element.style.gridRowStart = i + 1;
        element.style.gridRowEnd = i + 1 + 1;
        element.style.gridColumn = day + 2; // column1 = hour labels

        this.container.appendChild(element);
      }
    }
  }

  addEntry(element, date, startTime, endTime) {
    const rowStart = Math.round(timeStringToFloat(startTime) * this.resolution);
    const rowEnd = Math.round(timeStringToFloat(endTime) * this.resolution);
    const column = differenceInDays(this.startDay, date);

    element.style.gridRowStart = rowStart + 1;
    element.style.gridRowEnd = rowEnd + 1;
    element.style.gridColumn = column + 2;

    this.container.appendChild(element);
  }

  removeEntry(element) {
    element.remove();
  }

  get entries() {
    // todo should not know class name here
    return this.container.getElementsByClassName("calendar-connection");
  }

  onDrop(callback) {
    this.#onDropCallback = callback;
  }
}

class Calendar {
  #calendarGrid;

  // set all available event callbacks to noop
  #callbacks = {
    legChanged: () => {},
  };

  constructor(container, startDay, endDay, resolution) {
    this.#calendarGrid = new CalendarGrid(
      container,
      startDay,
      endDay,
      resolution,
    );

    document.addEventListener("legHover", (e) => {
      const leg = e.detail.leg;
      for (let connection of document.getElementsByClassName(leg)) {
        connection.classList.add("legSelected");
      }
    });

    document.addEventListener("legNoHover", (e) => {
      const leg = e.detail.leg;
      for (let connection of document.getElementsByClassName(leg)) {
        connection.classList.remove("legSelected");
      }
    });
  }

  on(eventName, callback) {
    if (eventName === "legChanged") this.#calendarGrid.onDrop(callback);
    else this.#callbacks[eventName] = callback; // todo check that event name allowed
  }

  updateView(connections) {
    // remove entries that are currently in calendar but no longer necessary
    const toRemove = [];
    for (const element of this.#calendarGrid.entries) {
      if (!connections[element.id]) {
        toRemove.push(element);
      }
    }
    for (const element of toRemove) {
      element.remove();
    }

    // loop over desired connections
    for (let connection of Object.values(connections)) {
      let element = document.getElementById(connection.data.id);

      // we don't yet have an element for this connection
      if (!element) {
        element = this.#createCalenderEntry(connection.data);
        this.#calendarGrid.addEntry(
          element,
          connection.data.date,
          connection.data.startTime,
          connection.data.endTime,
        );
        element.draggable = true;
        element.dataset.group = connection.data.leg.id;

        /*enableDragAndDrop(element, connection.data.leg.id, (leg, id) =>
          this.#callbacks["legChanged"](leg, id),
        );*/
      }

      if (connection.active) {
        element.classList.add("part-of-trip");
        element.classList.remove("alternative");
      } else {
        element.classList.add("alternative");
        element.classList.remove("part-of-trip");
      }
    }
  }

  #createCalenderEntry(connection) {
    const element = createElementFromTemplate("template-calendar-connection");

    element.id = connection.id;
    element.classList.add(connection.leg.id);

    element.getElementsByClassName("connection-icon")[0].src =
      `images/${connection.type}.svg`;
    element.getElementsByClassName("connection-number")[0].innerText =
      connection.displayId;

    // todo stop hardcoding
    if (!connection.id.endsWith("8503") && !connection.id.endsWith("18289")) {
      element.getElementsByClassName("connection-start-time")[0].innerText =
        connection.startTime;
      element.getElementsByClassName("connection-start-station")[0].innerText =
        connection.startStation.name;
      element.getElementsByClassName("connection-end-time")[0].innerText =
        connection.endTime;
      element.getElementsByClassName("connection-end-station")[0].innerText =
        connection.endStation.name;
    }

    // todo class-wide event listener?
    element.addEventListener("mouseover", (e) => {
      new LegHoverEvent(connection.leg.id).dispatch(document);
    });

    element.addEventListener("mouseout", (e) => {
      new LegNoHoverEvent(connection.leg.id).dispatch(document);
    });

    return element;
  }
}
