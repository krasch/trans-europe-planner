class JourneyError extends Error {
  constructor(message) {
    super(message);
    this.name = "JourneyError";
  }
}

class Journey {
  #connections;
  #cache;

  constructor(id, connectionsByLegs) {
    this.id = id;
    this.#connections = connectionsByLegs;
    this.#cache = {};
  }

  get unsortedConnections() {
    if (this.#connections.length === 0) return [];
    return Object.values(this.#connections);
  }

  get unsortedLegs() {
    return Object.keys(this.#connections);
  }

  setConnectionForLeg(leg, connection) {
    this.#connections[leg] = connection;
  }

  removeLeg(leg) {
    if (!this.#connections[leg])
      throw new JourneyError(`Can not remove non-existing leg ${leg}`);
    this.#cache[leg] = this.#connections[leg];
    delete this.#connections[leg];
  }

  previousConnection(leg) {
    if (this.#connections[leg])
      throw new JourneyError(`Leg is currently active`);
    return this.#cache[leg];
  }
}

class JourneyCollection {
  #journeys = [];
  #activeId = null;

  get activeJourney() {
    if (this.#activeId === null) return null;
    for (let j of this.#journeys) if (j.id === this.#activeId) return j;
  }

  get alternativeJourneys() {
    const result = [];
    for (let j of this.#journeys) if (j.id !== this.#activeId) result.push(j);
    return result;
  }

  get numJourneys() {
    return this.#journeys.length;
  }

  addJourney(connectionsByLeg) {
    const id = this.#journeys.length; // id todo make unique
    this.#journeys.push(new Journey(id, connectionsByLeg));
    return id;
  }

  setActive(journeyId) {
    this.#activeId = journeyId;
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
