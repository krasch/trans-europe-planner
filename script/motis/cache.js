// sessionStorage.clear();

export class ResponseCache {
  #outOfSpace = false;

  /**
   * @param {URL} url
   * @returns {object | null}
   */
  get(url) {
    const cached = sessionStorage.getItem(this.#key(url));
    if (!cached) return null;
    return JSON.parse(cached);
  }

  /**
   * @param {URL} url
   * @param {object} data
   */
  set(url, data) {
    if (this.#outOfSpace) return;

    try {
      sessionStorage.setItem(this.#key(url), JSON.stringify(data));
    } catch (QuotaExceededError) {
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
