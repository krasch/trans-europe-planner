class TravelOption extends HTMLElement {
  static observedAttributes = [
    "start-city",
    "end-city",
    "start-time",
    "end-time",
    "train",
    "status",
  ];

  constructor() {
    super();
  }

  get startTime() {
    return this.getAttribute("start-time");
  }

  set startTime(dateTime) {
    this.setAttribute("start-time", dateTime);
  }

  get startCity() {
    return this.getAttribute("start-city");
  }

  set startCity(city) {
    this.setAttribute("start-city", city);
  }

  get endTime() {
    return this.getAttribute("end-time");
  }

  set endTime(dateTime) {
    this.setAttribute("end-time", dateTime);
  }

  get endCity() {
    return this.getAttribute("end-city");
  }

  set endCity(city) {
    this.setAttribute("end-city", city);
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
}

customElements.define("travel-option", TravelOption);

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.TravelOption = TravelOption;
}
