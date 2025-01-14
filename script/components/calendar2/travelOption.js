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
}

customElements.define("travel-option", TravelOption);
