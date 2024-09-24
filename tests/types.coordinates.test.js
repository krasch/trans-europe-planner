const { Coordinates, IllegalCoordinateError } = require("../script/types.js");

test("latitudeTooSmall", function () {
  expect(() => new Coordinates(-91, 0)).toThrow(IllegalCoordinateError);
});

test("latitudeTooBig", function () {
  expect(() => new Coordinates(91, 0)).toThrow(IllegalCoordinateError);
});

test("longitudeTooSmall", function () {
  expect(() => new Coordinates(0, -181)).toThrow(IllegalCoordinateError);
});

test("longitudeTooBig", function () {
  expect(() => new Coordinates(0, 181)).toThrow(IllegalCoordinateError);
});
