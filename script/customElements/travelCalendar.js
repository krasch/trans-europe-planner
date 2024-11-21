const style = `
<style>
:host {
  /* can be set in external css to style this custom element */
  --calendar-lines: 1px dashed lightgrey;
  
  display: grid;
  grid-auto-flow: column;
  /* first column are the hour labels */
  grid-template-columns: 3rem repeat(3, minmax(0, 1fr)); /* todo 3 = num-days, todo calc? */
  
}

.border-top {
  border-top: var(--calendar-lines);
}

.hour-label {
  min-height: 1.2rem; /* todo external sizing? */

  color: darkgrey;
  text-align: center; /* horizontally center */
  align-content: center; /* vertically center*/
}

.cell {
  border-left: var(--calendar-lines);
}


.entry {
  --color: 27,158,119;
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

class TravelCalendar extends HTMLElement {
  static observedAttributes = ["numDays", "resolution"];
  static #observedStyles = ["visibility", "--color", "border", "border-radius"];

  // object can only have string keys
  // whereas map can also have complex keys (e.g. HTMLElements)
  #entries = new Map();

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = style + "<slot></slot>";
  }

  get resolution() {
    return Number(this.getAttribute("resolution"));
  }

  get numDays() {
    return Number(this.getAttribute("num-days"));
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

  #addTravelOption(travelOption) {
    const element = document.createElement("div");
    element.innerHTML = travelOption.train;
    element.classList.add("entry");
    element.classList.add(travelOption.status);

    const start = new Date(travelOption.startTime);
    const end = new Date(travelOption.endTime);
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
    const entry = this.#entries.get(travelOption);
    const style = window.getComputedStyle(travelOption);
    for (let key of TravelCalendar.#observedStyles) {
      entry.style.setProperty(key, style.getPropertyValue(key));
    }
  }

  #drawGrid() {
    // left column with hour labels
    for (let hour = 0; hour < 24; hour++) {
      const element = document.createElement("div");
      element.innerText = `${hour}`.padStart(2, "0");
      element.classList.add("hour-label");

      if (hour !== 0) element.classList.add("border-top");

      this.#placeInGrid(element, -1, hour * 60, (hour + 1) * 60);
    }

    // grid cells
    const minutesPerSlice = 60 / this.resolution; // todo rounding errors?
    for (let day = 0; day < this.numDays; day++) {
      for (let minute = 0; minute < 24 * 60; minute += minutesPerSlice) {
        const element = document.createElement("div");
        element.classList.add("cell");

        if (minute % 60 === 0 && minute > 0)
          element.classList.add("border-top");

        this.#placeInGrid(element, day, minute, minute + minutesPerSlice);
      }
    }
  }

  #placeInGrid(element, day, startMinute, endMinute) {
    const startRow = Math.round((startMinute / 60.0) * this.resolution);
    const endRow = Math.round((endMinute / 60.0) * this.resolution);

    // first +1 because counting starts at 1, second +1 for hour column
    element.style.gridColumn = day + 1 + 1;
    element.style.gridRowStart = startRow;
    element.style.gridRowEnd = endRow;

    this.shadowRoot.appendChild(element);
  }
}

customElements.define("travel-calendar", TravelCalendar);
