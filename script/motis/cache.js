// sessionStorage.clear();

export class ResponseCache {
  #outOfSpace = false;

  /**
   * @param {URL} url
   * @returns {object | null}
   */
  get(url) {
    const cached = localStorage.getItem(this.#key(url));
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
      localStorage.setItem(this.#key(url), JSON.stringify(data));
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
