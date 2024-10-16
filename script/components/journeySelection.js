class JourneySelection {
  #callbacks = {
    journeySelected: () => {},
  };
  constructor(container) {
    this.container = container;

    this.container.addEventListener("change", (e) => {
      this.#callbacks["journeySelected"](e.target.value);
    });
  }

  on(name, callback) {
    this.#callbacks[name] = callback;
  }

  get entries() {
    // Array.from is important when later wanting to delete elements
    return Array.from(this.container.querySelectorAll(".journey-info"));
  }

  updateView(journeys) {
    const journeyMap = new Map(journeys.map((j) => [j.id, j]));

    // remove journeys that are currently in view but no longer necessary todo not tested
    for (let entry of this.entries) {
      if (!journeyMap.has(entry.id)) entry.remove();
    }

    // add journeys that are currently not in view
    for (let journey of journeys) {
      if (!document.getElementById(journey.id)) {
        const data = {
          input: { value: journey.id, id: journey.id },
          label: { innerHTML: journey.id, htmlFor: journey.id },
        };
        const entry = createElementFromTemplate("template-journey-info", data);
        this.container.appendChild(entry);
      }
    }

    // mark as checked the active journey (there should only be one)
    for (let journey of journeys) {
      if (journey.active) document.getElementById(journey.id).checked = true;
    }
  }
}
