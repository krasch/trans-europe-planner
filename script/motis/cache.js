// sessionStorage.clear();
import { DateTime } from "script/types/dateTime.js";

export class ResponseCache {
  #outOfSpace = false;
  #TTL = null;

  /**
   * @param {Number} TTL in minutes
   */
  constructor(TTL = 60) {
    this.#TTL = TTL;
  }

  /**
   * @param {URL} url
   * @returns {object | null}
   */
  get(url) {
    const cached = localStorage.getItem(this.#key(url));
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (DateTime.fromISO(parsed.expires) < DateTime.now()) {
      localStorage.removeItem(this.#key(url));
      return null;
    }

    return parsed.payload;
  }

  /**
   * @param {URL} url
   * @param {object} data
   */
  set(url, data) {
    if (this.#outOfSpace) return;

    const cacheObject = JSON.stringify({
      payload: data,
      expires: DateTime.now().plus({ minutes: this.#TTL }).toISO(),
    });

    try {
      localStorage.setItem(this.#key(url), cacheObject);
    } catch (error) {
      this.#outOfSpace = true;
    }
  }

  /**
   * @param {URL} url
   * @returns {string}
   */
  #key(url) {
    return `motis_response_${url.toString()}`;
  }
}
