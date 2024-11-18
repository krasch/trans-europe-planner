/*const gridHourTemplate = document.createElement("template");
gridHourTemplate.innerHTML = `
<style>
button {
  background: var(--background);
  color: var(--color);
  padding: var(--padding);
  font-size: var(--font-size);
  border: 0;
}
</style>
<div></div>`;*/

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

  constructor() {
    super();

    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = style;
  }

  connectedCallback() {
    this.#drawGrid();
  }

  attributeChangedCallback(name, oldValue, newValue) {
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
