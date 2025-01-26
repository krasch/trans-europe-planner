export class JourneyError extends Error {
  constructor(message) {
    super(message);
    this.name = "JourneyError";
  }
}

export class Journey {
  #connectionIds;

  constructor(connectionIds) {
    this.#connectionIds = connectionIds;

    const cities = [this.#connectionIds[0].startCityName];
    for (let c of this.#connectionIds) cities.push(c.endCityName);

    this.id = cities.join("->"); // todo is this unique enough?
  }

  get connectionIds() {
    return this.#connectionIds;
  }

  get start() {
    return this.#connectionIds[0].startCityName;
  }

  get destination() {
    return this.#connectionIds.at(-1).endCityName;
  }

  connections(database) {
    return this.#lookupConnections(database);
  }

  replaceLeg(replacementConnectionId) {
    const index = this.#legIndex(
      replacementConnectionId.startCityName,
      replacementConnectionId.endCityName,
    );
    this.#connectionIds[index] = replacementConnectionId;
  }

  shiftDate(deltaDays, database) {
    for (let i in this.#connectionIds) {
      const id = this.#connectionIds[i];

      // will throw database error if no suitable connection can be found
      // currently this won't happen because all connections available on all dates
      const connection = database.connection(
        id.id,
        id.startCityName,
        id.endCityName,
        id.date.plus({ days: deltaDays }),
      );
      this.#connectionIds[i] = connection.uniqueId;
    }
  }

  split(splitCityName, database) {
    const connections = this.#lookupConnections(database);

    let idx = null;
    for (let i in connections) {
      idx = Number(i); // important to convert to Number, otherwise slice/splice will give weird results

      if (connections[i].hasStop(splitCityName)) {
        // is already split, nothing to do
        if (
          connections[i].startCityName === splitCityName ||
          connections[i].endCityName === splitCityName
        )
          return;

        // will not notice if there are multiple connections in the journey stopping in this city
        // but that would be an illegal journey anyway
        break;
      }
    }

    if (idx === null)
      throw new JourneyError(
        `Journey has no stop in ${splitCityName}, can not split`,
      );

    // splitting like this makes sure that the correct stop dates are used
    // splitting by asking the database for pieces makes this more complicated
    // todo perhaps add a splitConnection method to database?
    let split1 = connections[idx].slice(
      this.#connectionIds[idx].startCityName,
      splitCityName,
    );
    let split2 = connections[idx].slice(
      splitCityName,
      this.#connectionIds[idx].endCityName,
    );

    // since we worked around the database with the previous step,
    // just make sure that database knows the split pieces
    // should really logically not go wrong
    split1 = database.connection(
      split1.id,
      split1.startCityName,
      split1.endCityName,
      split1.date,
    );
    split2 = database.connection(
      split2.id,
      split2.startCityName,
      split2.endCityName,
      split2.date,
    );

    this.#connectionIds[idx] = split1.uniqueId;
    this.#connectionIds.splice(idx + 1, 0, split2.uniqueId); // insert and shift
  }

  undoSplit(cityName, database) {
    // todo this is WIP
    // issue: if after splitting have moved the connections, can not super easily join them again
    // need to rewrite their timings etc, lots of work, not important enough right now

    let idx = null;

    for (let i = 1; i < this.#connectionIds.length; i++) {
      i = Number(i);

      const prev = this.#connectionIds[i - 1];
      const cur = this.#connectionIds[i];

      // will not notice if there are multiple places where the below is true
      // but that would be an illegal journey anyway
      if (
        prev.endCityName === cityName &&
        cur.endCityName === cityName &&
        prev.id === cur.id // needs to be the same train
      )
        idx = i;
    }
  }

  summary(database) {
    const connections = this.#lookupConnections(database);

    const vias = [];
    for (let c of this.#connectionIds) {
      if (c.startCityName !== this.start && !vias.includes(c.startCityName))
        vias.push(c.startCityName);
      if (c.endCityName !== this.destination && !vias.includes(c.endCityName))
        vias.push(c.endCityName);
    }

    const departure = connections[0].stops[0].departure;
    const arrival = connections.at(-1).stops.at(-1).arrival;

    return {
      from: this.start,
      to: this.destination,
      numTransfer: vias.length,
      travelTime: arrival.diff(departure).as("minutes"),
      via: vias,
    };
  }

  #legIndex(startCityName, endCityName) {
    for (let i in this.#connectionIds) {
      const id = this.connectionIds[i];
      if (id.startCityName === startCityName && id.endCityName === endCityName)
        return Number(i);
    }
    throw new JourneyError(`Unknown leg ${startCityName}->${endCityName}`);
  }

  #lookupConnections(database) {
    return this.connectionIds.map((c) =>
      database.connection(c.id, c.startCityName, c.endCityName, c.date),
    );
  }
}

export class JourneyCollection {
  #journeys = {};
  #activeId = null;

  get hasActiveJourney() {
    return this.#activeId !== null;
  }

  get activeJourney() {
    if (this.#activeId === null) return null;
    return this.#journeys[this.#activeId];
  }

  get journeys() {
    return Array.from(Object.values(this.#journeys));
  }

  addJourney(journey) {
    this.#journeys[journey.id] = journey;
  }

  setActive(journeyId) {
    this.#activeId = journeyId;
  }

  shiftDate(deltaDays, database) {
    for (let id in this.#journeys)
      this.#journeys[id].shiftDate(deltaDays, database);
  }

  reset() {
    this.#journeys = {};
    this.#activeId = null;
  }
}
