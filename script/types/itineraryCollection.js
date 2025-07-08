// todo should this be state.js?

export class ItineraryCollection {
  #itineraries;
  #activeId;

  constructor(itineraries = null) {
    this.#itineraries = new Map();
    this.#activeId = null;
    if (itineraries) this.replaceAll(itineraries);
  }

  get hasActive() {
    return this.#activeId !== null && this.#activeId !== undefined;
  }

  get active() {
    return this.#itineraries.get(this.#activeId);
  }

  get all() {
    return Array.from(this.#itineraries.values());
  }

  replaceAll(itineraries) {
    this.#itineraries = new Map();
    this.#activeId = null;
    for (let itinerary of itineraries)
      this.#itineraries.set(itinerary.id, itinerary);
  }

  setActive(activeId) {
    this.#activeId = activeId; // todo check if exists?
  }
}
