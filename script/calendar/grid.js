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
