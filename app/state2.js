import { DateTime } from "app/types/dateTime.js";

export class State2 {
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

    this.updateFromURLParams(params);
  }

  /**
   * @return {URLSearchParams}
   */
  toURLParams() {
    const params = new URLSearchParams();
    if (this.from) params.set("start", this.from);
    if (this.to) params.set("destination", this.to);
    if (this.date) params.set("date", this.date);
    return params;
  }

  /**
   * @param {URLSearchParams} urlParams
   */
  updateFromURLParams(urlParams) {
    if (urlParams.get("from")) this.from = urlParams.get("from");
    if (urlParams.get("to")) this.to = urlParams.get("to");
    if (urlParams.get("date")) this.date = urlParams.get("date");
  }
}
