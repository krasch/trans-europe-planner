class CalendarEntry extends HTMLElement {
  #visibilityStates = ["hidden", "indicator", "preview", "full"];

  constructor(id, group) {
    super();
    this.id = id;
    this.group = group;

    this._internals = this.attachInternals();
  }

  set visibility(status) {
    if (!this.#visibilityStates.includes(status))
      throw Error(`Unknown visibility status ${status}`);

    // make sure only this one visibility state is set
    for (const s of this.#visibilityStates) this._internals.states.delete(s);
    this._internals.states.add(status);
  }
}

customElements.define("calendar-entry", CalendarEntry);
