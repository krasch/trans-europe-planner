let types = require("../script/types.js");

test("latitudeTooSmall", function () {
  expect(() => new types.Coordinates(-91, 0)).toThrow(
    types.IllegalCoordinateError,
  );
});

test("latitudeTooBig", function () {
  expect(() => new types.Coordinates(91, 0)).toThrow(
    types.IllegalCoordinateError,
  );
});

test("longitudeTooSmall", function () {
  expect(() => new types.Coordinates(0, -181)).toThrow(
    types.IllegalCoordinateError,
  );
});

test("longitudeTooBig", function () {
  expect(() => new types.Coordinates(0, 181)).toThrow(
    types.IllegalCoordinateError,
  );
});

test("idFromCoordinatesBothPositive", function () {
  const coordinates = new types.Coordinates(52.5255, 13.3695);
  expect(coordinates.id).toBe("1525255133695");
});

test("idFromCoordinatesLatitudePositiveLongitudeNegative", function () {
  const coordinates = new types.Coordinates(52.5255, -13.3695);
  expect(coordinates.id).toBe("2525255133695");
});

test("idFromCoordinatesLatitudeNegativeLongitudePositive", function () {
  const coordinates = new types.Coordinates(-52.5255, 13.3695);
  expect(coordinates.id).toBe("3525255133695");
});

test("idFromCoordinatesBothNegative", function () {
  const coordinates = new types.Coordinates(-52.5255, -13.3695);
  expect(coordinates.id).toBe("4525255133695");
});

test("idFromCoordinatesWith4DecimalPlaces", function () {
  const coordinates = new types.Coordinates(52.5255, 13.3695);
  expect(coordinates.id).toBe("1525255133695");
});

test("idFromCoordinatesWith6DecimalPlaces", function () {
  const coordinates = new types.Coordinates(52.525589, 13.369548);
  expect(coordinates.id).toBe("1525255133695");
});

test("idFromCoordinatesWith1DecimalPlace", function () {
  const coordinates = new types.Coordinates(52.5, 13.3);
  expect(coordinates.id).toBe("1525000133000");
});
