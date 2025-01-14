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

.entry-part {
  --color: 128,128,128;
  overflow: hidden;
  border-radius: 10px;
}
.entry-part[status=selected] {
    border: 1px solid darkgrey;
    background-color: rgba(var(--color), 0.6);
}
.entry-part[status=selected].hover {
    background-color: rgba(var(--color), 0.8);
}
.entry-part[status=hidden] {
  visibility: hidden;
}
/* faint highlight to show that dropping is possible here */
.entry-part[status=indicator] {
  border-top: 1px dashed rgba(var(--color));
  border-radius: 0;
}
.entry-part[status=indicator] > * {
  visibility: hidden; 
}
/* drag&drop mode and user is hovering over this drop zone */
.entry-part[status=preview] {
  background-color: rgba(var(--color), 0.8);
}
.entry-part[status=preview] > * {
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

function createStopElement(datetime, city) {
  const element = document.createElement("div");
  element.innerHTML = `
   <div>
       <span class="time">${datetime.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
       <span class="city">${city}
   </div>`;
  return element;
}

class TravelCalendar extends HTMLElement {
  static observedAttributes = ["start-date"];

  //static #observedStyles = ["visibility", "--color", "border", "border-radius"];

  // object can only have string keys
  // whereas map can also have complex keys (e.g. HTMLElements)
  #mappingExternalToInternal = new Map();
  #mappingInternalToExternal = new Map();

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = style;

    this.shadowRoot.addEventListener("mouseover", (e) => {
      const closest = e.target.closest(".entry-part");
      if (!closest) return;

      for (let part of this.#getAllPartsForEntry(closest))
        part.classList.add("hover");
    });

    this.shadowRoot.addEventListener("mouseout", (e) => {
      const closest = e.target.closest(".entry-part");
      if (!closest) return;

      for (let part of this.#getAllPartsForEntry(closest))
        part.classList.remove("hover");
    });
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
            if (node.tagName === "TRAVEL-OPTION") this.#addEntry(node);
          }
          for (let node of mutation.removedNodes) {
            if (node.tagName === "TRAVEL-OPTION") this.#removeEntry(node);
          }
        }

        // child attributes changed
        if (mutation.type === "attributes") {
          if (mutation.target.tagName === "TRAVEL-OPTION") {
            if (mutation.target.attributeName === "style")
              this.#propagateStyle(mutation.target);
            else {
              this.#removeEntry(mutation.target);
              this.#addEntry(mutation.target);
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
      // because they will get initialized during connectedCallback
      for (let i in labels) {
        labels[i].innerHTML = formatDateLabel(newValue, i);
      }

      const options = Array.from(this.children);
      for (let travelOption of options) {
        this.#removeEntry(travelOption);
        this.#addEntry(travelOption);
      }
    }
  }

  #addEntry(travelOption) {
    const startDateTime = new Date(travelOption.startTime);
    const endDateTime = new Date(travelOption.endTime);

    const from = createStopElement(startDateTime, travelOption.startCity);
    from.classList.add("from");

    const to = createStopElement(endDateTime, travelOption.endCity);
    to.classList.add("to");

    const startColumn = this.#getColumn(startDateTime);
    const endColumn = this.#getColumn(endDateTime);

    const elements = [];
    for (let column = startColumn; column < endColumn + 1; column++) {
      const element = document.createElement("div");
      element.setAttribute("status", travelOption.status);
      element.classList.add("entry-part");

      let startRow = 0; // beginning of day
      if (column === startColumn) {
        startRow = this.#getRow(startDateTime);
        element.appendChild(from);
      }

      let endRow = 24 * RESOLUTION; // end of day
      if (column === endColumn) {
        endRow = this.#getRow(endDateTime);
        element.appendChild(to);
      }

      this.#setGridLocation(
        element,
        column + 1, // +1 for hour column
        startRow + 1, // +1 for header row
        endRow + 1, // +1 for header row
      );
      this.shadowRoot.appendChild(element);

      elements.push(element);
    }

    this.#mappingExternalToInternal.set(travelOption, elements);
    for (let el of elements)
      this.#mappingInternalToExternal.set(el, travelOption);
  }

  #removeEntry(travelOption) {
    for (let element of this.#mappingExternalToInternal.get(travelOption)) {
      this.shadowRoot.removeChild(element);
      this.#mappingInternalToExternal.delete(element);
    }
    this.#mappingExternalToInternal.delete(travelOption);
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

      this.#setGridLocation(
        element,
        0,
        hour * RESOLUTION + 1, // +1 for header row
        (hour + 1) * RESOLUTION + 1, // +1 for header row
      );
      this.shadowRoot.appendChild(element);
    }

    // date labels at top of calendar
    for (let day = 0; day < NUM_DAYS; day++) {
      const element = document.createElement("div");
      element.innerHTML = formatDateLabel(this.startDate, day);
      element.classList.add("date-label");

      this.#setGridLocation(
        element,
        day + 1, //+1 for hour column
        0,
        1,
      );
      this.shadowRoot.appendChild(element);
    }

    // grid cells
    for (let day = 0; day < NUM_DAYS; day++) {
      for (let row = 0; row < 24 * RESOLUTION; row++) {
        const element = document.createElement("div");
        element.classList.add("cell");

        if (row % RESOLUTION === 0) element.classList.add("full-hour");

        this.#setGridLocation(
          element,
          day + 1, // +1 for hour column
          row + 1, // +1 for header row
          row + 1 + 1, // + 1 for header row
        );
        this.shadowRoot.appendChild(element);
      }
    }
  }

  #setGridLocation(element, column, startRow, endRow) {
    // +1 because grid is one-indexed (not zero-indexed)
    element.style.gridColumn = column + 1;
    element.style.gridRowStart = startRow + 1;
    element.style.gridRowEnd = endRow + 1;
  }

  #getRow(datetime) {
    // todo time zones, dst
    const minute = datetime.getHours() * 60 + datetime.getMinutes();
    return Math.round((minute / 60.0) * RESOLUTION);
  }

  #getColumn(datetime) {
    // todo time zones, dst
    const midnight = new Date(datetime.toDateString());
    const diffMillis = midnight - new Date(this.startDate);
    return Math.round(diffMillis / (1000 * 60 * 60 * 24));
  }

  *#getAllPartsForEntry(onePart) {
    const parent = this.#mappingInternalToExternal.get(onePart);
    for (let part of this.#mappingExternalToInternal.get(parent)) yield part;
  }
}

customElements.define("travel-calendar", TravelCalendar); // todo move to main?

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.TravelCalendar = TravelCalendar;
}
