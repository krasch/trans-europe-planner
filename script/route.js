class Route {
  constructor() {
    this.route = [];
  }

  add(item) {
    this.route.push(item);
  }

  get connectingStations() {
    const stationIds = [];

    for (const item of this.route) {
      if (!(item.start in stationIds)) stationIds.push(item.start);
      if (!(item.end in stationIds)) stationIds.push(item.end);
    }

    return stationIds.map((id) => STATIONS[id]);
  }

  _getTrainInfo(train, date) {
    const start = train.stops[0];
    const end = train.stops.at(-1);

    return {
      id: train.id,
      name: train.displayId,
      type: train.type,
      date: date,
      start: start.station,
      startStation: STATIONS[start.station],
      startTime: start.time,
      end: end.station,
      endStation: STATIONS[end.station],
      endTime: end.time,
    };
  }

  get trains() {
    const trains = [];

    for (const item of this.route) {
      const train = CONNECTIONS[`${item.start} -> ${item.end}`][item.id];
      trains.push(this._getTrainInfo(train, item.date));
    }

    return trains;
  }

  *getAlternatives(train) {
    const key = `${train.start} -> ${train.end}`;
    for (let trainId in CONNECTIONS[key]) {
      const alternative = CONNECTIONS[key][trainId];
      yield this._getTrainInfo(alternative, new Date("2023-10-17"));
    }
  }
}
