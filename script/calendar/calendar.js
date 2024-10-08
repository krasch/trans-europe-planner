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
      const closest = e.target.closest("calendar-entry");
      if (!closest) return;

      // the "group" attributes of the element being dragged (source)
      // and the element where the mouse is currently over (target)
      const groupSource = e.dataTransfer.getData("leg");
      const groupTarget = closest.group;

      // both group attributes must be the same
      return groupSource === groupTarget;
    };

    container.addEventListener("dragstart", (e) => {
      // can only drag calendar entries
      const closest = e.target.closest("calendar-entry");
      if (!closest) return;

      const leg = closest.group;

      e.dataTransfer.dropEffect = "move";
      e.dataTransfer.setData("leg", leg);

      // this is a group action
      for (let alt of this.getEntriesForGroup(leg)) {
        if (alt.id !== closest.id) alt.visibility = "indicator";
      }
    });

    // enters a valid drop target
    container.addEventListener("dragenter", (e) => {
      if (!this.isValidDropTarget(e)) return;
      e.preventDefault();

      const closest = e.target.closest("calendar-entry");
      closest.visibility = "preview";
    });

    // this event is fired every few hundred milliseconds
    container.addEventListener("dragover", (e) => {
      if (!this.isValidDropTarget(e)) return;
      e.preventDefault(); // must do preventDefault so that drop event is fired

      const closest = e.target.closest("calendar-entry");
      closest.visibility = "preview";
    });

    // leaves a valid drop target
    container.addEventListener("dragleave", (e) => {
      if (!this.isValidDropTarget(e)) return;
      e.preventDefault();

      const closest = e.target.closest("calendar-entry");
      closest.visibility = "indicator";
    });

    // drop: from drop target; // dragend: from dragged item
    container.addEventListener("drop", (e) => {
      if (!this.isValidDropTarget(e)) return;
      e.preventDefault();

      const closest = e.target.closest("calendar-entry");

      // hide original item from calendar -> global state, should callback
      this.#onDropCallback(closest.group, closest.id);
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

  addEntry(element) {
    const startTime = element.startDateTime;
    const endTime = element.endDateTime;

    const rowStart = Math.round(
      (startTime.minutesSinceMidnight / 60.0) * this.resolution,
    );
    const rowEnd = Math.round(
      (endTime.minutesSinceMidnight / 60.0) * this.resolution,
    );
    const column = startTime.daysSince(this.startDay);

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
    return this.container.getElementsByTagName("calendar-entry");
  }

  *getEntriesForGroup(group) {
    for (const e of document.getElementsByTagName("calendar-entry")) {
      if (e.group === group) yield e;
    }
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

    /*document.addEventListener("legHover", (e) => {
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

    container.addEventListener("mouseover", (e) => {
      if (e.target.tagName !== "CALENDAR-ENTRY") return;
      new LegHoverEvent(e.target.group).dispatch(document);
    });

    container.addEventListener("mouseout", (e) => {
      if (e.target.tagName !== "CALENDAR-ENTRY") return;
      new LegNoHoverEvent(e.target.group).dispatch(document);
    });*/
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
        element = createCalendarEntry(connection.data);
        this.#calendarGrid.addEntry(element);
        element.draggable = true;
      }

      if (connection.active) element.visibility = "full";
      else element.visibility = "hidden";
    }
  }
}
