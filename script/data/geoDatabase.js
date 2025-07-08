export class DataError extends Error {
  constructor(message) {
    super(message);
    this.name = "DataError";
  }
}

export class GeoDatabase {
  #cities;
  #stops;

  #cityNameToId;
  #cityIdToStopIds;
  #motisStopIdToStopId;

  constructor(cities, stops) {
    this.#cities = new Map(Object.entries(cities)); // {id: {cityData}}
    this.#stops = new Map(Object.entries(stops)); // {id: {stopData}}

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

  cityNameToId(name) {
    if (!this.#cityNameToId.has(name))
      throw new DataError(`City with name ${name} unknown`);

    return this.#cityNameToId.get(name);
  }

  motisStopIdForCityId(cityId) {
    if (!this.#cityIdToStopIds.has(cityId))
      throw new DataError(`City with id ${cityId} unknown`);

    const mainStop = this.#cityIdToStopIds.get(cityId).mainStopId;
    return this.#stops.get(mainStop).motisIds[0]; // todo very implicit
  }

  stopForMotisStopId(motisStopId) {
    if (!this.#motisStopIdToStopId.has(motisStopId))
      throw new DataError(`Stop with motis stop id ${motisStopId} unknown`);

    const stopId = this.#motisStopIdToStopId.get(motisStopId);
    return { id: stopId, name: this.#stops.get(stopId).name };
  }

  cityForStopId(stopId) {
    if (!this.#stops.has(stopId))
      throw new DataError(`Stop with id ${stopId} unknown`);

    const stop = this.#stops.get(stopId);
    return { id: stop.cityId, name: this.#cities.get(stop.cityId).name };
  }
}
