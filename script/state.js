import { Itinerary } from "./types/itinerary.js";

export class StateError extends Error {
  constructor(message) {
    super(message);
    this.name = "StateError";
  }
}

export class State {
  #activeItinerary;
  #otherItineraries;

  constructor(homeCityId, desiredStartDate) {
    this.homeCityId = homeCityId;
    this.desiredStartDate = desiredStartDate;

    this.#activeItinerary = null;
    this.#otherItineraries = {};
  }

  get activeItinerary() {
    return this.#activeItinerary;
  }

  get otherItineraries() {
    return Object.values(this.#otherItineraries);
  }

  setActiveItinerary(itineraryId) {
    // nothing to do, this itinerary is already the active one
    if (this.#activeItinerary && this.activeItinerary.id === itineraryId)
      return;

    if (!this.#otherItineraries[itineraryId])
      throw new StateError(`Unknown itinerary with id ${itineraryId}`);

    // previously active itinerary becomes other itinerary
    if (this.#activeItinerary)
      this.#otherItineraries[this.#activeItinerary.id] = this.#activeItinerary;

    // and the newly active one goes from other to active
    this.#activeItinerary = this.#otherItineraries[itineraryId];
    delete this.#otherItineraries[itineraryId];
  }

  replaceItineraries(itineraries, setFirstAsActive = false) {
    if (itineraries.length === 0)
      throw new StateError("List of itineraries is empty");

    this.#activeItinerary = null;
    this.#otherItineraries = {};

    for (let itinerary of itineraries) {
      if (this.#otherItineraries[itinerary.id])
        throw new StateError(`Duplicate itineraries: ${itinerary.id}`);

      // todo check if correct home?
      this.#otherItineraries[itinerary.id] = itinerary;
    }

    if (setFirstAsActive) this.setActiveItinerary(itineraries[0].id);
  }

  replaceLegInActiveItinerary(newConnection) {
    // todo move whole thing into itinerary?

    if (!this.#activeItinerary)
      throw new StateError("No itinerary is currently set to active");

    // todo
    const ref = `${newConnection.from.city.id}->${newConnection.to.city.id}`;

    // make copy
    const connections = Array.from(this.#activeItinerary.connections);

    let found = false;
    for (let i in connections) {
      const leg = `${connections[i].from.city.id}->${connections[i].to.city.id}`; // todo

      // move into itinerary: getConnectionForLeg
      if (ref === leg) {
        connections[i] = newConnection; // overwrite todo make more obvious
        found = true;
      }
    }

    if (!found)
      throw new StateError(`Leg ${ref} is not part of current itinerary`);

    this.#activeItinerary = new Itinerary(connections);
  }
}
