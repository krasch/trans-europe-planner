class StartDestinationView {
  #callbacks = {
    startOrDestinationChanged: () => {},
  };

  constructor(startSelectContainer, destSelectContainer) {
    this.start = startSelectContainer;
    this.dest = destSelectContainer;

    this.start.addEventListener("change", (e) => this.#broadcastTarget());
    this.dest.addEventListener("change", (e) => this.#broadcastTarget());
  }

  on(name, callback) {
    this.#callbacks[name] = callback;
  }

  triggerChangeEvent() {
    this.#broadcastTarget();
  }

  #broadcastTarget() {
    const start = this.start.options[this.start.selectedIndex].value;
    const dest = this.dest.options[this.dest.selectedIndex].value;

    let target = null;
    if (start.length > 0 && dest.length > 0) {
      target = `${start}->${dest}`;
    }

    this.#callbacks["startOrDestinationChanged"](target);
  }
}
