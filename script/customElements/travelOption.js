class TravelOptions extends HTMLElement {
  static observedAttributes = ["start-city", "end-city"];
}

class TravelOption extends HTMLElement {
  static observedAttributes = ["start-hour", "end-hour", "train"];

  get startHour() {
    return this.getAttribute("start-hour");
  }

  get endHour() {
    return this.getAttribute("end-hour");
  }

  get train() {
    return this.getAttribute("train");
  }
}

customElements.define("travel-options", TravelOptions);
customElements.define("travel-option", TravelOption);
