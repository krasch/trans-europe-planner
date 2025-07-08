export class Stop {
  constructor(stopId, stopName, city, arrival, departure) {
    this.stopId = stopId;
    this.stopName = stopName;
    this.city = city; // {id: , name: }
    this.arrival = arrival;
    this.departure = departure;
  }
}
