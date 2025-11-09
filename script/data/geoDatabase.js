export class DataError extends Error {
  /**
   * @param {string} message
   */
  constructor(message) {
    super(message);
    this.name = "DataError";
  }
}

/*
todo the three below describe the schema of the static dataset we are loading
- can we make that clearer?
- can we avoid some of the data transformations?
 */

/**
 * @typedef Geo
 * @type {object}
 * @property {number} latitude
 * @property {number} longitude
 */

/**
 * @typedef CityData
 * @type {object}
 * @property {string} name
 * @property {Geo} geo
 * @property {boolean} isDestination
 */

/**
 * @typedef StopData
 * @type {object}
 * @property {string} name
 * @property {Geo} geo
 * @property {string} cityId
 * @property {string} country
 * @property {string[]} motisIds
 * @property {boolean} secondary
 */

export class GeoDatabase {
  /** @type {Map<string,CityData>} */
  #cities;
  /** @type {Map<string,StopData>} */
  #stops;

  /** @type {Map<string,string>} */
  #cityNameToId;
  /** @type {Map<string,{stopIds: string[], mainStopId: string}>} */
  #cityIdToStopIds;
  /** @type {Map<string,string>} */
  #motisStopIdToStopId;

  /**
   * @param { Object.<String,CityData>} cities {id: cityData}
   * @param { Object.<String,StopData>} stops {id: stopData}
   */
  constructor(cities, stops) {
    this.#cities = new Map(Object.entries(cities));
    this.#stops = new Map(Object.entries(stops));

    this.#cityNameToId = new Map();
    this.#cityIdToStopIds = new Map();
    this.#motisStopIdToStopId = new Map();

    this.#cities.forEach((city, cityId) => {
      this.#cityNameToId.set(city.name, cityId);
      this.#cityIdToStopIds.set(cityId, { stopIds: [], mainStopId: null });
    });

    this.#stops.forEach((stop, stopId) => {
      if (!this.#cities.has(stop.cityId))
        throw new DataError(`Stop ${stopId} references unknown city`);

      this.#cityIdToStopIds.get(stop.cityId).stopIds.push(stopId);

      if (stop.motisIds)
        stop.motisIds.forEach((m) => this.#motisStopIdToStopId.set(m, stopId));
    });

    // set main stop per city
    this.#cities.forEach((city, cityId) => {
      const stopIds = this.#cityIdToStopIds.get(cityId).stopIds;

      if (stopIds.length === 0)
        throw new DataError(`City ${cityId} ${city.name} has no stops`);

      const main = stopIds.filter((s) => !this.#stops.get(s).secondary);
      if (main.length === 0)
        throw new DataError(`City ${cityId} ${city.name} has no main stop`);
      else if (main.length > 1)
        throw new DataError(`City ${cityId} ${city.name} has >1 main stops`);

      this.#cityIdToStopIds.get(cityId).mainStopId = main[0];
    });
  }

  get geoDataForAllCities() {
    const result = [];
    this.#cities.forEach((cityData, cityId) => {
      result.push({
        id: cityId,
        name: cityData.name,
        lngLat: [cityData.geo.longitude, cityData.geo.latitude],
        isDestination: cityData.isDestination,
      });
    });
    return result;
  }

  /**
   * @param {string} name
   * @returns {string} id
   */
  cityNameToId(name) {
    if (!this.#cityNameToId.has(name))
      throw new DataError(`City with name ${name} unknown`);

    return this.#cityNameToId.get(name);
  }

  /**
   * todo test
   * @param {string} cityId
   * @returns {{stopIds: string[], mainStopId: string}} stopIds
   */
  stopIdsForCityId(cityId) {
    if (!this.#cityIdToStopIds.has(cityId))
      throw new DataError(`City with id ${cityId} unknown`);

    return this.#cityIdToStopIds.get(cityId);
  }

  /**
   * @param {string} cityId
   * @returns {string} motisStopId
   */
  motisStopIdForCityId(cityId) {
    if (!this.#cityIdToStopIds.has(cityId))
      throw new DataError(`City with id ${cityId} unknown`);

    const mainStop = this.#cityIdToStopIds.get(cityId).mainStopId; // todo could be multiple stops in the city
    return this.#stops.get(mainStop).motisIds[0]; // todo very implicit
  }

  /**
   * todo yet another stop object
   * @typedef StopInfo
   * @type {object}
   * @property {string} id
   * @property {string} name
   *
   * @param {string} motisStopId
   * @returns {StopInfo}
   */
  stopForMotisStopId(motisStopId) {
    if (!this.#motisStopIdToStopId.has(motisStopId))
      throw new DataError(`Stop with motis stop id ${motisStopId} unknown`);

    const stopId = this.#motisStopIdToStopId.get(motisStopId);
    return { id: stopId, name: this.#stops.get(stopId).name };
  }

  /**
   * todo yet another city object
   * @typedef CityInfo
   * @type {object}
   * @property {string} id
   * @property {string} name
   *
   * @param {string} stopId
   * @returns CityInfo
   */
  cityForStopId(stopId) {
    if (!this.#stops.has(stopId))
      throw new DataError(`Stop with id ${stopId} unknown`);

    const stop = this.#stops.get(stopId);
    return { id: stop.cityId, name: this.#cities.get(stop.cityId).name };
  }

  /**
   * todo test
   * @param {string} stopId
   */
  stopName(stopId) {
    if (!this.#stops.has(stopId))
      throw new DataError(`Stop with id ${stopId} unknown`);
    return this.#stops.get(stopId).name;
  }
}
