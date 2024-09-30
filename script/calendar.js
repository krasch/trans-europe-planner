function enableDragAndDrop(element, leg, onDropCallback) {
  console.log(onDropCallback);

  element.addEventListener("dragstart", (e) => {
    e.dataTransfer.dropEffect = "move";
    e.dataTransfer.setData("calenderItemId", element.id);
    e.dataTransfer.setData("leg", leg);

    // this is a group action
    for (let alt of document.getElementsByClassName(leg)) {
      alt.classList.add("possibleDropTarget");
    }
  });

  element.addEventListener("dragenter", (e) => {
    // enters a valid drop target
    const leg = e.dataTransfer.getData("leg");
    if (!e.target.classList.contains(leg)) return;

    e.preventDefault();
    e.target.classList.add("selectedDropTarget");
  });

  element.addEventListener("dragleave", (e) => {
    // leaves a valid drop target
    const leg = e.dataTransfer.getData("leg");
    if (!e.target.classList.contains(leg)) return;

    e.preventDefault();
    e.target.classList.remove("selectedDropTarget");
  });

  element.addEventListener("dragover", (e) => {
    // regularly called
    const leg = e.dataTransfer.getData("leg");
    if (!e.target.classList.contains(leg)) return;

    e.preventDefault(); // must do preventDefault so that drop event is fired
  });

  element.addEventListener("drop", (e) => {
    // drop: from drop target; // dragend: from dragged itme
    const leg = e.dataTransfer.getData("leg");
    if (!e.target.classList.contains(leg)) return;

    e.preventDefault();
    e.target.classList.remove("selectedDropTarget");

    // this is a group action
    for (let alt of document.getElementsByClassName(leg)) {
      alt.classList.remove("possibleDropTarget");
    }

    // hide original item from calendar -> global state, should callback
    onDropCallback(e.dataTransfer.getData("leg"), e.target.id);
  });
}

class CalendarGrid {
  constructor(container, startDay, endDay, resolution) {
    this.container = container;
    this.startDay = startDay;
    this.endDay = endDay;
    this.resolution = resolution;
    this.numDays = 3; // todo

    this.#initGrid();
  }

  #initGrid() {
    /* hour label on left side of calendar */
    for (let hour = 0; hour < 24; hour++) {
      const element = createElementFromTemplate("template-calendar-grid-hour");

      element.style.gridRowStart = hour * this.resolution + 1;
      element.style.gridRowEnd = (hour + 1) * this.resolution + 1;
      element.style.gridColumn = 1;

      element.innerText = `${hour}`.padStart(2, "0");

      this.container.appendChild(element);
    }

    /* empty calender cells */
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
    return this.container.getElementsByClassName("calendar-connection"); // todo
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
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback; // todo check that event name allowed
  }

  updateView(connections) {
    for (const element of this.#calendarGrid.entries) {
      // if an element is currently in the calendar but no longer relevant -> remove it
      if (!connections.has(element.id)) element.remove();
    }

    // currently relevant connections
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

        /*enableDragAndDrop(
          element,
          connection.leg.id,
          this.#callbacks.legChanged(),
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

    /*// todo should move somewhere else
    document.addEventListener("legHover", (e) => {
      const leg = e.detail.leg;
      for (let connection of document.getElementsByClassName(leg)) {
        connection.classList.add("legSelected");
      }
    });

    // todo should move somewhere else
    document.addEventListener("legNoHover", (e) => {
      const leg = e.detail.leg;
      for (let connection of document.getElementsByClassName(leg)) {
        connection.classList.remove("legSelected");
      }
    });*/
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

    // todo class-wide event listener?
    element.addEventListener("mouseover", (e) => {
      new LegHoverEvent(connection.leg.id, "calendar").dispatch(document);
    });

    element.addEventListener("mouseout", (e) => {
      new LegNoHoverEvent(connection.leg.id, "calendar").dispatch(document);
    });

    return element;
  }
}
