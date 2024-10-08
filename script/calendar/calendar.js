class Calendar {
  #grid;

  #callbacks = {
    legChanged: () => {},
  };

  constructor(grid) {
    this.#grid = grid;
  }

  on(eventName, callback) {
    if (eventName === "legChanged") this.#grid.onDrop(callback);
    else this.#callbacks[eventName] = callback; // todo check that event name allowed
  }

  updateView(connections) {
    // remove entries that are currently in calendar but no longer necessary
    const toRemove = [];
    for (const element of this.#grid.entries) {
      if (!connections[element.id]) {
        toRemove.push(element);
      }
    }
    for (const element of toRemove) {
      element.remove();
    }

    // loop over desired connections
    for (let connection of Object.values(connections)) {
      let element = document.getElementById(connection.data.id);

      // we don't yet have an element for this connection
      if (!element) {
        element = createCalendarEntry(connection.data);
        this.#grid.addEntry(element);
        element.draggable = true;
      }

      if (connection.active) element.visibility = "full";
      else element.visibility = "hidden";
    }
  }
}
