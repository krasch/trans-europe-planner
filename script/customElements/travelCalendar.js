const style = `
<style>
:host {
  /* can be set in external css to style this custom element */
  --background-color: white;
  
  display: grid;
  grid-auto-flow: column;
  /* first column are the hour labels */
  grid-template-columns: 3rem repeat(3, 1fr); /* todo 3 = num-days, todo calc? */
  
  border-radius: 10px;
  border: 1px solid lightgrey;
  background-color: var(--background-color);
}

.border-top {
  border-top: 1px dashed lightgrey;
}

.hour-label {
  min-height: 1.2rem;

  color: darkgrey;
  text-align: center; /* horizontally center */
  align-content: center; /* vertically center*/
}

.cell {
  border-left: 1px dashed lightgrey;
}

</style>`;

class TravelCalendar extends HTMLElement {
  #numDays = 3; // todo is not being read from attribute
  #resolution;
  static observedAttributes = ["numDays", "resolution"];

  // object can only have string keys
  // whereas map can also have complex keys (e.g. HTMLElements)
  #entries = new Map();

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = style + "<slot></slot>";
  }

  connectedCallback() {
    this.#drawGrid();

    const observer = new MutationObserver((mutations) => {
      for (let mutation of mutations) {
        // children added/removed
        if (mutation.type === "childList") {
          for (let node of mutation.addedNodes) {
            if (node.tagName === "CALENDAR-ENTRY2")
              this.#entryAddedCallback(node);
          }
          for (let node of mutation.removedNodes) {
            if (node.tagName === "CALENDAR-ENTRY2")
              this.#entryRemovedCallback(node);
          }
        }

        // child attributes changed
        if (mutation.type === "attributes") {
          if (mutation.target.tagName === "CALENDAR-ENTRY2") {
            this.#entryRemovedCallback(mutation.target);
            this.#entryAddedCallback(mutation.target);
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
    // todo redraw?
    switch (name) {
      case "resolution":
        this.#resolution = Number(newValue);
        break;
      case "num-days":
        this.#numDays = Number(newValue);
        break;

      default:
        throw new Error(`Unknown attribute ${name}`);
    }
  }

  #entryAddedCallback(entry) {
    const element = document.createElement("div");
    element.innerHTML = entry.getAttribute("train");

    const startHour = entry.getAttribute("start-hour");
    const endHour = entry.getAttribute("end-hour");

    element.style.gridColumn = 3; // 1 = date column
    element.style.gridRowStart = startHour * this.#resolution;
    element.style.gridRowEnd = endHour * this.#resolution;
    element.style.background = "beige";
    this.shadowRoot.appendChild(element);

    this.#entries.set(entry, element);
  }

  #entryRemovedCallback(entry) {
    this.shadowRoot.removeChild(this.#entries.get(entry));
    this.#entries.delete(entry);
  }

  #drawGrid() {
    // left column with hour labels
    for (let hour = 0; hour < 24; hour++) {
      const element = document.createElement("div");
      element.innerText = `${hour}`.padStart(2, "0");
      element.classList.add("hour-label");

      if (hour !== 0) element.classList.add("border-top");

      element.style.gridColumn = 1; // 1 = date column
      element.style.gridRowStart = hour * this.#resolution;
      element.style.gridRowEnd = (hour + 1) * this.#resolution;
      this.shadowRoot.appendChild(element);
    }

    // grid cells
    for (let day = 0; day < this.#numDays; day++) {
      for (let i = 0; i < 24 * this.#resolution; i++) {
        const element = document.createElement("div");
        element.classList.add("cell");

        if (i % this.#resolution === 0 && i > 0)
          element.classList.add("border-top");

        // element.id = `calender-cell-${day}-${i}`;
        element.style.gridColumn = day + 1 + 1;
        element.style.gridRowStart = i;
        element.style.gridRowEnd = i + 1;
        this.shadowRoot.appendChild(element);
      }
    }
  }
}

customElements.define("travel-calendar", TravelCalendar);
