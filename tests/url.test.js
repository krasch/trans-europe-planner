import { expect, test } from "vitest";

import { URL_DEFAULTS } from "app/config.js";
import { ConnectionId } from "app/types/connection.js";
import { DateTime } from "app/types/dateTime.js";
import { fillURLParams, parseURLParams } from "app/url.js";

import { DAY1 } from "tests/_helpers/data.js";

test("Parse empty url", async () => {
  const url = "";
  const parsed = parseURLParams(url);

  expect(parsed).toStrictEqual({
    from: null,
    to: null,
    calendarStartDate: null,
    active: [],
    alternatives: [],
    zoom: URL_DEFAULTS.mapZoom,
    center: URL_DEFAULTS.mapCenter,
  });
});

test("Parse URL where from+to+date are set", async () => {
  const url = "from=S1&to=S2&calStart=2024-10-01";
  const parsed = parseURLParams(url);

  expect(parsed).toStrictEqual({
    from: "S1",
    to: "S2",
    calendarStartDate: DateTime.fromISO("2024-10-01"),
    active: [],
    alternatives: [],
    zoom: URL_DEFAULTS.mapZoom,
    center: URL_DEFAULTS.mapCenter,
  });
});

test("Parse URL with active with one connection", async () => {
  const c1 = "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15";
  const url = "from=S1&to=S2&calStart=2024-10-15&" + c1;
  const parsed = parseURLParams(url);

  expect(parsed).toStrictEqual({
    from: "S1",
    to: "S2",
    calendarStartDate: DAY1,
    active: [new ConnectionId("T1", "S1", "S2", DAY1)],
    alternatives: [],
    zoom: URL_DEFAULTS.mapZoom,
    center: URL_DEFAULTS.mapCenter,
  });
});

test("Parse URL with active with multiple connections", async () => {
  const connections = [
    "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15",
    "trip-id=T2&trip-from=S2&trip-to=S3&trip-date=2024-10-15",
    "trip-id=T3&trip-from=S3&trip-to=S4&trip-date=2024-10-16",
  ];
  const url = "from=S1&to=S2&calStart=2024-10-15&" + connections.join("&");
  const parsed = parseURLParams(url);

  expect(parsed).toStrictEqual({
    from: "S1",
    to: "S2",
    calendarStartDate: DAY1,
    active: [
      new ConnectionId("T1", "S1", "S2", DAY1),
      new ConnectionId("T2", "S2", "S3", DAY1),
      new ConnectionId("T3", "S3", "S4", DAY1.plus({ days: 1 })),
    ],
    alternatives: [],
    zoom: URL_DEFAULTS.mapZoom,
    center: URL_DEFAULTS.mapCenter,
  });
});

test("Parse URL with active and alternatives", async () => {
  const connections = [
    // active c1
    "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15",
    // alt1 c1
    "alt1-trip-id=T5&alt1-trip-from=S1&alt1-trip-to=S2&alt1-trip-date=2024-10-15",
    // alt2 c1
    "alt2-trip-id=T6&alt2-trip-from=S1&alt2-trip-to=S3&alt2-trip-date=2024-10-15",
    // alt2 c2
    "alt2-trip-id=T7&alt2-trip-from=S3&alt2-trip-to=S2&alt2-trip-date=2024-10-16",
  ];

  const url = "from=S1&to=S2&calStart=2024-10-15&" + connections.join("&");
  const parsed = parseURLParams(url);

  expect(parsed).toStrictEqual({
    from: "S1",
    to: "S2",
    calendarStartDate: DAY1,
    active: [new ConnectionId("T1", "S1", "S2", DAY1)],
    alternatives: [
      [new ConnectionId("T5", "S1", "S2", DAY1)],
      [
        new ConnectionId("T6", "S1", "S3", DAY1),
        new ConnectionId("T7", "S3", "S2", DAY1.plus({ days: 1 })),
      ],
    ],
    zoom: URL_DEFAULTS.mapZoom,
    center: URL_DEFAULTS.mapCenter,
  });
});

test("Create empty url", async () => {
  const searchParams = fillURLParams();
  expect(searchParams.toString()).toStrictEqual("");
});

test("Create url without connection", async () => {
  const searchParams = fillURLParams("S1", "S2", DAY1);

  const exp = "from=S1&to=S2&calStart=2024-10-15";
  expect(searchParams.toString()).toStrictEqual(exp);
});

test("Create url with active itinerary with one connection", async () => {
  const active = [new ConnectionId("T1", "S1", "S2", DAY1)];
  const searchParams = fillURLParams("S1", "S2", DAY1, active);

  const connStrings = [
    // active c1
    "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15",
  ];
  const exp = "from=S1&to=S2&calStart=2024-10-15&" + connStrings.join("&");
  expect(searchParams.toString()).toStrictEqual(exp);
});

test("Create url with active itinerary with multiple connections", async () => {
  const active = [
    new ConnectionId("T1", "S1", "S2", DAY1),
    new ConnectionId("T2", "S2", "S3", DAY1),
    new ConnectionId("T3", "S3", "S4", DAY1.plus({ days: 1 })),
  ];
  const searchParams = fillURLParams("S1", "S4", DAY1, active);

  const connStrings = [
    // active c1
    "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15",
    // active c2
    "trip-id=T2&trip-from=S2&trip-to=S3&trip-date=2024-10-15",
    // active c3
    "trip-id=T3&trip-from=S3&trip-to=S4&trip-date=2024-10-16",
  ];
  const exp = "from=S1&to=S4&calStart=2024-10-15&" + connStrings.join("&");
  expect(searchParams.toString()).toStrictEqual(exp);
});

test("Create url with active itinerary and empty alternatives", async () => {
  const active = [new ConnectionId("T1", "S1", "S2", DAY1)];
  const searchParams = fillURLParams("S1", "S2", DAY1, active, []);

  const connStrings = [
    // active c1
    "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15",
  ];
  const exp = "from=S1&to=S2&calStart=2024-10-15&" + connStrings.join("&");
  expect(searchParams.toString()).toStrictEqual(exp);
});

test("Create url with active itinerary and one alternative", async () => {
  const active = [new ConnectionId("T1", "S1", "S2", DAY1)];
  const alternative1 = [new ConnectionId("T5", "S1", "S2", DAY1)];

  const searchParams = fillURLParams("S1", "S2", DAY1, active, [alternative1]);

  const connStrings = [
    // active c1
    "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15",
    // alternative c1
    "alt1-trip-id=T5&alt1-trip-from=S1&alt1-trip-to=S2&alt1-trip-date=2024-10-15",
  ];

  const exp = "from=S1&to=S2&calStart=2024-10-15&" + connStrings.join("&");
  expect(searchParams.toString()).toStrictEqual(exp);
});

test("Create url with active itinerary and multiple alternatives", async () => {
  const active = [new ConnectionId("T1", "S1", "S2", DAY1)];
  const alternative1 = [new ConnectionId("T5", "S1", "S2", DAY1)];
  const alternative2 = [
    new ConnectionId("T6", "S1", "S3", DAY1),
    new ConnectionId("T7", "S3", "S2", DAY1.plus({ days: 1 })),
  ];

  const searchParams = fillURLParams("S1", "S2", DAY1, active, [
    alternative1,
    alternative2,
  ]);

  const connStrings = [
    // active c1
    "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15",
    // alt1 c1
    "alt1-trip-id=T5&alt1-trip-from=S1&alt1-trip-to=S2&alt1-trip-date=2024-10-15",
    // alt2 c1
    "alt2-trip-id=T6&alt2-trip-from=S1&alt2-trip-to=S3&alt2-trip-date=2024-10-15",
    // alt2 c2
    "alt2-trip-id=T7&alt2-trip-from=S3&alt2-trip-to=S2&alt2-trip-date=2024-10-16",
  ];

  const exp = "from=S1&to=S2&calStart=2024-10-15&" + connStrings.join("&");
  expect(searchParams.toString()).toStrictEqual(exp);
});
