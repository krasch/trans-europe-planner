import { Itinerary } from "script/types/itinerary.js";

export class StateError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "StateError";
  }
}

export class State {
  /** @type {Itinerary} */
  #activeItinerary;

  /** @type {Object.<string,Itinerary>} */
  #otherItineraries;

  constructor() {
    this.#activeItinerary = null;
    this.#otherItineraries = {};
  }

  /**
   * @returns {Itinerary | null}
   */
  get activeItinerary() {
    return this.#activeItinerary;
  }

  /**
   * @returns {Itinerary[]}
   */
  get otherItineraries() {
    return Object.values(this.#otherItineraries);
  }

  /**
   * @param {string} itineraryId
   */
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

  /**
   * @param {Itinerary[]} itineraries
   */
  replaceItineraries(itineraries) {
    if (itineraries.length === 0)
      throw new StateError("List of itineraries is empty");

    this.#activeItinerary = null;
    this.#otherItineraries = {};

    for (let itinerary of itineraries) {
      if (this.#otherItineraries[itinerary.id])
        throw new StateError(`Duplicate itineraries: ${itinerary.id}`);

      this.#otherItineraries[itinerary.id] = itinerary;
    }

    this.setActiveItinerary(itineraries[0].id);
  }

  replaceLegInActiveItinerary(newConnection) {
    this.#activeItinerary = this.activeItinerary.replaceLeg(newConnection);
  }
}
