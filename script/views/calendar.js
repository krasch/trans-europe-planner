class CalendarView {
  #callbacks = {
    legChanged: () => {},
    entryHoverStart: () => {},
    entryHoverStop: () => {},
  };

  constructor(calendar) {
    this.calendar = calendar;
  }

  on(name, callback) {
    this.#callbacks[name] = callback; // todo check that name valid
  }

  updateView(connections) {
    // remove entries that are currently in calendar but no longer necessary
    const connectionIds = connections.map((c) => c.id);
    for (let entry of this.calendar.children) {
      if (!connectionIds.includes(entry.id)) entry.remove();
    }

    // add entries that are not yet in calendar
    for (let connection of connections) {
      if (!document.getElementById(connection.id)) {
        const entry = new TravelOption();
        entry.id = connection.id;
        entry.startTime = connection.startDateTime.ISOString;
        entry.endTime = connection.endDateTime.ISOString;
        entry.train = connection.displayId;

        //entry.draggable = true; // todo this should not be here
        this.calendar.appendChild(entry);
      }
    }

    // only show the currently active entries
    for (let connection of connections) {
      const entry = document.getElementById(connection.id);

      if (connection.active) entry.status = "full";
      else entry.status = "hidden";

      entry.color = connection.color;
    }
  }
}
