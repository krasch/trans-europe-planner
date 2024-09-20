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

  get trains() {
    const trains = [];
    for (const item of this.route) {
      const train = CONNECTIONS[`${item.start} -> ${item.end}`][item.id];
      trains.push({
        id: item.id,
        name: train.displayId,
        type: item.type,
        date: item.date,
        startStation: STATIONS[item.start],
        startTime: train.stops[0].time,
        endStation: STATIONS[item.end],
        endTime: train.stops.at(-1).time,
      });
    }

    return trains;
  }
}
