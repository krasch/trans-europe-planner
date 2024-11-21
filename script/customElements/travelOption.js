class TravelOptionGroup extends HTMLElement {
  static observedAttributes = ["start-city", "end-city"];
}

class TravelOption extends HTMLElement {
  static observedAttributes = [
    "start-city",
    "end-city",
    "start-time",
    "end-time",
    "train",
    "status",
  ];

  get startTime() {
    return this.getAttribute("start-time");
  }

  set startTime(dateTime) {
    this.setAttribute("start-time", dateTime);
  }

  get endTime() {
    return this.getAttribute("end-time");
  }

  set endTime(dateTime) {
    this.setAttribute("end-time", dateTime);
  }

  get train() {
    return this.getAttribute("train");
  }

  set train(train) {
    this.setAttribute("train", train);
  }

  get status() {
    return this.getAttribute("status");
  }

  set status(status) {
    // one of ["hidden", "indicator", "preview", "full"];
    return this.setAttribute("status", status);
  }

  set color(color) {
    this.style.setProperty("--color", color);
  }

  /*set visibility(status) {
    if (!this.#visibilityStates.includes(status))
      throw Error(`Unknown visibility status ${status}`);

    // remove all other visibility states
    for (const s of this.#visibilityStates) {
      if (s !== status) this.classList.remove(s);
    }
    // set new visibility status
    if (!this.classList.contains(status)) this.classList.add(status);
  }*/
}

customElements.define("travel-option-group", TravelOptionGroup);
customElements.define("travel-option", TravelOption);
