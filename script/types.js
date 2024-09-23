class IllegalCoordinateError extends Error {
  constructor(message) {
    super(message);
    this.name = "IllegalCoordinate";
  }
}

class Coordinates {
  constructor(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;

    if (this.latitude < -90 || this.latitude > 90)
      throw new IllegalCoordinateError(
        `Latitude is ${this.latitude}, should be in [-90, 90]`,
      );

    if (this.longitude < -180 || this.longitude > 180)
      throw new IllegalCoordinateError(
        `Longitude is ${this.longitude}, should be in [-180, 180]`,
      );
  }

  get #idPrefix() {
    if (this.latitude >= 0 && this.longitude >= 0) return 1;
    if (this.latitude >= 0 && this.longitude < 0) return 2;
    if (this.latitude < 0 && this.longitude >= 0) return 3;
    if (this.latitude < 0 && this.longitude < 0) return 4;
  }

  get id() {
    const latitudeAsInt = Math.floor(Math.abs(this.latitude) * 10000);
    const longitudeAsInt = Math.floor(Math.abs(this.longitude) * 10000);
    return `${this.#idPrefix}${latitudeAsInt}${longitudeAsInt}`;
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.IllegalCoordinateError = IllegalCoordinateError;
  module.exports.Coordinates = Coordinates;
}
