class CalendarGrid extends HTMLElement {
  static observedAttributes = ["start", "end", "resolution"];

  constructor() {
    super();

    this.resolution = null;
    this.startDay = null;
    this.endDay = null;
    this.numDays = 3; // todo
  }

  //called when element is added to DOM
  connectedCallback() {
    this.#initHourLabels();
    this.#initEmptyCalendarCells();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "resolution") this.resolution = newValue;
    if (name === "start") this.startDay = newValue;
    if (name === "end") this.endDay = newValue;
  }

  addToGrid(element) {
    const column = element.startDateTime.daysSince(this.startDay);
    const rowStart = this.#getRow(element.startDateTime);
    const rowEnd = this.#getRow(element.endDateTime);
    this.#addToGrid(element, column, rowStart, rowEnd);
  }

  #getRow(datetime) {
    return Math.round((datetime.minutesSinceMidnight / 60.0) * this.resolution);
  }

  #addToGrid(element, column, rowStart, rowEnd) {
    element.style.gridColumn = column + 2; // column 1 is date column
    element.style.gridRowStart = rowStart + 1;
    element.style.gridRowEnd = rowEnd + 1;
    this.appendChild(element);
  }

  #initHourLabels() {
    for (let hour = 0; hour < 24; hour++) {
      const element = createElementFromTemplate("template-calendar-grid-hour");
      element.innerText = `${hour}`.padStart(2, "0");

      this.#addToGrid(
        element,
        -1,
        hour * this.resolution,
        (hour + 1) * this.resolution,
      );
    }
  }

  #initEmptyCalendarCells() {
    for (let day = 0; day < this.numDays; day++) {
      for (let i = 0; i < 24 * this.resolution; i++) {
        const element = createElementFromTemplate(
          "template-calendar-grid-cell",
        );
        element.id = `calender-cell-${day}-${i}`;
        this.#addToGrid(element, day, i, i + 1);
      }
    }
  }
}

class DragNDropCalendarGrid extends CalendarGrid {
  #onDropCallback = () => {}; // noop

  constructor(container, startDay, endDay, resolution) {
    super(container, startDay, endDay, resolution);

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

  onDrop(callback) {
    this.#onDropCallback = callback;
  }
}