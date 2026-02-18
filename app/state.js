import { GeocodedLocation } from "app/motis/parser.js";
import { DateTime } from "app/types/dateTime.js";
import { Itinerary } from "app/types/itinerary.js";

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

  #callbacks = {
    itineraryUpdated: () => {},
    configUpdated: () => {},
  };

  /**
   * @param {URLSearchParams} [params]
   */
  constructor(params) {
    const today = DateTime.now().startOf("day");
    const isMobile = window.matchMedia("(max-width: 1000px)");

    // default config form settings
    this.from = null;
    this.to = null;
    this.date = today.plus({ days: 30 });

    // default map settings
    this.zoom = 7.3;
    if (isMobile.matches) this.zoom = 5.3;
    this.center = [11.75685, 54.0443];

    this.#activeItinerary = null;
    this.#otherItineraries = {};

    this.updateFromURLParams(params);
  }

  on(eventName, callback) {
    this.#callbacks[eventName] = callback;
  }

  /**
   * @return {URLSearchParams}
   */
  toURLParams() {
    const params = new URLSearchParams();
    //if (this.from) params.set("from", this.from);
    //if (this.to) params.set("to", this.to);
    if (this.date) params.set("date", this.date);
    return params;
  }

  /**
   * @param {URLSearchParams} urlParams
   */
  updateFromURLParams(urlParams) {
    // todo must lookup / convert to GeocodedLocation
    //if (urlParams.get("from")) this.from = urlParams.get("from");
    //if (urlParams.get("to")) this.to = urlParams.get("to");
    if (urlParams.get("date")) this.date = urlParams.get("date");
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
   * @param {GeocodedLocation} from
   * @param {GeocodedLocation} to
   * @param {DateTime} date
   */
  setConfigFormValues(from, to, date) {
    this.from = from;
    this.to = to;
    this.date = date;
    this.#callbacks.configUpdated();
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

    this.#callbacks.itineraryUpdated();
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
    this.#callbacks.itineraryUpdated();
  }

  replaceLegInActiveItinerary(newConnection) {
    this.#activeItinerary = this.activeItinerary.replaceLeg(newConnection);
    this.#callbacks.itineraryUpdated();
  }
}
