class JourneyError extends Error {
  constructor(message) {
    super(message);
    this.name = "JourneyError";
  }
}

class Journey {
  #connectionIds;
  #legs;

  constructor(id, connectionIds) {
    this.id = id;
    this.#connectionIds = connectionIds;

    this.#legs = this.#connectionIds.map((c) => c.leg);
  }

  get connectionIds() {
    return this.#connectionIds;
  }

  get legs() {
    return this.#legs;
  }

  get start() {
    return this.#legs[0].startCityName;
  }

  get destination() {
    return this.#legs.at(-1).endCityName;
  }

  updateLeg(connectionId) {
    const index = this.#legIndex(connectionId.leg);
    this.#connectionIds[index] = connectionId;
  }

  #legIndex(leg) {
    for (let i in this.#legs) {
      if (this.#legs[i].toString() === leg.toString()) return Number(i);
    }
    throw new JourneyError(`Unknown leg ${leg}`);
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
