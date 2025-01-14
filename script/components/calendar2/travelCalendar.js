const LOCALE = new Intl.NumberFormat().resolvedOptions().locale;

const NUM_DAYS = 3;
const RESOLUTION = 4; // "slices" per hour

const style = `
<style>

:host {
  /* the following can be set in external css to style this custom element */
  --calendar-lines: 1px dashed lightgrey;
  --calendar-text-color: darkgrey;
  
  width: 100%;
  display: grid;
  font-size: 0.8rem;
  
  --header-rows: 8;
  --num-rows: calc(24 * ${RESOLUTION});
  --row-height: 0.3rem; /* instead set max height externally? */
  
  grid-auto-flow: column; /* do I even need the below ?*/
  grid-template-rows: 3rem repeat(var(--num-rows), var(--row-height));
  grid-template-columns: 3rem repeat(${NUM_DAYS}, 1fr);
  
}

:host([hidden]) { 
   display: none 
}

/* styling the calendar grid */
.hour-label {  
  text-align: center; /* horizontally */
  align-content: center; /* vertically*/  
  
  border-top: var(--calendar-lines);
  color: var(--calendar-text-color);
}
.date-label {
  text-align: center; /* horizontally */
  align-content: center; /* vertically*/
  
  border-left: var(--calendar-lines);
  color: var(--calendar-text-color);
}
.cell {
  height: var(--row-height);
  border-left: var(--calendar-lines);
}
.cell.full-hour {
  border-top: var(--calendar-lines);
}

.entry {
  --color: 128,128,128;
  overflow: hidden;
  border: 1px solid darkgrey;
}
.entry.full {
    border: 1px solid darkgrey;
    border-radius: 10px;
    background-color: rgba(var(--color), 0.6);
}
.entry.hidden {
  visibility: hidden;
}
</style>`;

function formatDateLabel(startDateString, offset) {
  const date = new Date(startDateString);
  date.setDate(date.getDate() + Number(offset));

  const weekday = date.toLocaleString(LOCALE, { weekday: "short" });
  const dateString = date.toLocaleString(LOCALE, {
    month: "short",
    day: "numeric",
  });
  return `${weekday} <br/> ${dateString}`;
}

class TravelCalendar extends HTMLElement {
  static observedAttributes = ["start-date"];

  //static #observedStyles = ["visibility", "--color", "border", "border-radius"];

  // object can only have string keys
  // whereas map can also have complex keys (e.g. HTMLElements)
  #entries = new Map();

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = style + "<slot></slot>";
  }

  get startDate() {
    return this.getAttribute("start-date");
  }

  set startDate(date) {
    this.setAttribute("start-date", date);
  }

  connectedCallback() {
    this.#drawGrid();

    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        // children added/removed
        if (mutation.type === "childList") {
          for (let node of mutation.addedNodes) {
            if (node.tagName === "TRAVEL-OPTION") this.#addTravelOption(node);
          }
          for (let node of mutation.removedNodes) {
            if (node.tagName === "TRAVEL-OPTION")
              this.#removeTravelOption(node);
          }
        }

        // child attributes changed
        if (mutation.type === "attributes") {
          if (mutation.target.tagName === "TRAVEL-OPTION") {
            if (mutation.target.attributeName === "style")
              this.#propagateStyle(mutation.target);
            else {
              this.#removeTravelOption(mutation.target);
              this.#addTravelOption(mutation.target);
            }
          }
        }
      }
    });

    observer.observe(this.shadowRoot.host, {
      subtree: true,
      childList: true,
      attributes: true,
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "start-date" && oldValue !== newValue) {
      const labels = Array.from(
        this.shadowRoot.querySelectorAll(".date-label"),
      );

      // this callback might come before the grid has been initialized
      // in this case labels will be empty, which is not an issue
      // because it will get initialized with that newValue during connectedCallback
      for (let i in labels) {
        labels[i].innerHTML = formatDateLabel(newValue, i);
      }
    }
  }

  #addTravelOption(travelOption) {
    const element = document.createElement("div");
    element.innerText = "ladida";

    element.classList.add("entry");
    element.classList.add(travelOption.status);

    const start = new luxon.DateTime.fromISO(travelOption.startTime);
    const end = new luxon.DateTime.fromISO(travelOption.endTime);
    const date = start.getDate() - 16; // todo place in right column

    const startMinute = start.getHours() * 60 + start.getMinutes();
    const endMinute = end.getHours() * 60 + end.getMinutes();

    this.#placeInGrid(element, date, startMinute, endMinute);
    this.#entries.set(travelOption, element);

    this.#propagateStyle(travelOption);
  }

  #removeTravelOption(travelOption) {
    this.shadowRoot.removeChild(this.#entries.get(travelOption));
    this.#entries.delete(travelOption);
  }

  #propagateStyle(travelOption) {
    /*const entry = this.#entries.get(travelOption);
    const style = window.getComputedStyle(travelOption);
    for (let key of TravelCalendar.#observedStyles) {
      entry.style.setProperty(key, style.getPropertyValue(key));
    }*/
  }

  #drawGrid() {
    // hour labels at left of calendar
    for (let hour = 0; hour < 24; hour++) {
      const element = document.createElement("div");
      element.innerText = `${hour}`.padStart(2, "0");
      element.classList.add("hour-label");

      this.#placeInGrid(
        element,
        0,
        hour * RESOLUTION + 1, // +1 for header row
        (hour + 1) * RESOLUTION + 1, // +1 for header row
      );
    }

    // date labels at top of calendar
    for (let day = 0; day < NUM_DAYS; day++) {
      const element = document.createElement("div");
      element.innerHTML = formatDateLabel(this.startDate, day);
      element.classList.add("date-label");

      this.#placeInGrid(
        element,
        day + 1, //+1 for date label column
        0,
        1,
      );
    }

    // grid cells
    for (let day = 0; day < NUM_DAYS; day++) {
      for (let row = 0; row < 24 * RESOLUTION; row++) {
        const element = document.createElement("div");
        element.classList.add("cell");

        if (row % RESOLUTION === 0) element.classList.add("full-hour");

        this.#placeInGrid(
          element,
          day + 1, // +1 for hour label column
          row + 1, // +1 for header row
          row + 1 + 1, // + 1 for header row
        );
      }
    }
  }

  #placeInGrid(element, column, startRow, endRow) {
    // +1 because grid is one-indexed (not zero-indexed)
    element.style.gridColumn = column + 1;
    element.style.gridRowStart = startRow + 1;
    element.style.gridRowEnd = endRow + 1;
    this.shadowRoot.appendChild(element);
  }

  #getRow(minute) {
    return Math.round((minute / 60.0) * RESOLUTION) + HEADER_ROWS;
  }

  #getColumn(date) {
    // todo das her habe ich gemacht, beide getRow und getColumn sollen luxon datetime nehmen
  }
}

customElements.define("travel-calendar", TravelCalendar); // todo move to main?

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.TravelCalendar = TravelCalendar;
}
