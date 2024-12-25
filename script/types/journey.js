class JourneyError extends Error {
  constructor(message) {
    super(message);
    this.name = "JourneyError";
  }
}

function shiftDate(date, deltaDays) {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + deltaDays);
  return copy;
}

function diffDays(datetime, laterDatetime) {
  // get rid of hours/minutes/seconds
  datetime = new Date(datetime.toDateString());
  laterDatetime = new Date(laterDatetime.toDateString());

  const diffMillis = laterDatetime - datetime;
  return Math.ceil(diffMillis / (1000 * 60 * 60 * 24));
}

class Journey {
  #connectionIds;

  constructor(connectionIds) {
    this.#connectionIds = connectionIds;
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

  replaceLeg(replacementConnectionId) {
    const index = this.#legIndex(
      replacementConnectionId.startCityName,
      replacementConnectionId.endCityName,
    );
    this.#connectionIds[index] = replacementConnectionId;
  }

  changeDate(newDate, database) {
    const currentDate = this.#connectionIds[0].date;
    if (newDate.toDateString() === currentDate.toDateString()) return;

    // todo unify all diffDays implementations, like why does this one need -1?
    // the -1 also makes that this does not work when date is the same, hence the extra check above
    const deltaDays = diffDays(currentDate, newDate) - 1;

    for (let i in this.#connectionIds) {
      const id = this.#connectionIds[i];

      // will throw database error if no suitable connection can be found
      // currently this won't happen because all connections available on all dates
      const connection = database.connection(
        id.id,
        id.startCityName,
        id.endCityName,
        shiftDate(id.date, deltaDays),
      );
      this.#connectionIds[i] = connection.uniqueId;
    }
  }

  split(splitCityName, database) {
    const connections = this.connectionIds.map((c) =>
      database.connection(c.id, c.startCityName, c.endCityName, c.date),
    );

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

  #legIndex(startCityName, endCityName) {
    for (let i in this.#connectionIds) {
      const id = this.connectionIds[i];
      if (id.startCityName === startCityName && id.endCityName === endCityName)
        return Number(i);
    }
    throw new JourneyError(`Unknown leg ${startCityName}->${endCityName}`);
  }
}

class JourneyCollection {
  #journeys = [];
  #activeId = null;

  get hasActiveJourney() {
    return this.#activeId !== null;
  }

  get activeJourney() {
    if (this.#activeId === null) return null;
    for (let j of this.#journeys) if (j.id === this.#activeId) return j;
  }

  get journeys() {
    return this.#journeys;
  }

  addJourney(connections) {
    const legs = connections.map((c) => c.leg.toString());
    const id = legs.join(";");
    this.#journeys.push(new Journey(id, connections));
    return id;
  }

  setActive(journeyId) {
    this.#activeId = journeyId;
  }

  setShortestAsActive() {
    if (this.#journeys.length === 0) return;

    let shortest = this.#journeys[0];
    for (let journey of this.#journeys.slice(1))
      if (journey.legs.length < shortest.legs.length) shortest = journey;

    this.setActive(shortest.id);
  }

  cutActiveJourney(cityName, database) {
    if (!this.#activeId) return;

    const active = this.activeJourney;
    for (let id of active.connectionIds) {
      const connection = database.connection(id);
    }
  }

  reset() {
    this.#journeys = [];
    this.#activeId = null;
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.Journey = Journey;
  module.exports.JourneyCollection = JourneyCollection;
  module.exports.JourneyError = JourneyError;
}
