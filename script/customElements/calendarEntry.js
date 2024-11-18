class CalendarEntry2 extends HTMLElement {
  static observedAttributes = ["start-hour", "end-hour", "train"];

  constructor() {
    super();
  }
}

customElements.define("calendar-entry2", CalendarEntry2);
