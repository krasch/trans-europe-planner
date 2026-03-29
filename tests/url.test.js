import { expect, test } from "vitest";

import { ConnectionId } from "app/types/connection.js";
import { DateTime } from "app/types/dateTime.js";
import { DEFAULTS, fillURLParams, parseURLParams } from "app/url.js";

import { DAY1, itineraryFromShortHand as _i } from "tests/_helpers/data.js";

test("Parse empty url", async () => {
  const url = "";
  const parsed = parseURLParams(url);

  expect(parsed).toStrictEqual({
    from: null,
    to: null,
    date: null,
    connectionIds: [],
    zoom: DEFAULTS.zoom,
    center: DEFAULTS.center,
  });
});

test("Parse URL where from+to+date are set", async () => {
  const url = "from=S1&to=S2&date=2024-10-01";
  const parsed = parseURLParams(url);

  expect(parsed).toStrictEqual({
    from: "S1",
    to: "S2",
    date: DateTime.fromISO("2024-10-01"),
    connectionIds: [],
    zoom: DEFAULTS.zoom,
    center: DEFAULTS.center,
  });
});

test("Parse URL with one connection", async () => {
  const c1 = "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15";
  const url = "from=S1&to=S2&date=2024-10-15&" + c1;
  const parsed = parseURLParams(url);

  expect(parsed).toStrictEqual({
    from: "S1",
    to: "S2",
    date: DAY1,
    connectionIds: [new ConnectionId("T1", "S1", "S2", DAY1)],
    zoom: DEFAULTS.zoom,
    center: DEFAULTS.center,
  });
});

test("Parse URL with multiple connections", async () => {
  const c1 = "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15";
  const c2 = "trip-id=T2&trip-from=S2&trip-to=S3&trip-date=2024-10-15";
  const c3 = "trip-id=T3&trip-from=S3&trip-to=S4&trip-date=2024-10-16";
  const url = "from=S1&to=S2&date=2024-10-15&" + c1 + "&" + c2 + "&" + c3;
  const parsed = parseURLParams(url);

  expect(parsed).toStrictEqual({
    from: "S1",
    to: "S2",
    date: DAY1,
    connectionIds: [
      new ConnectionId("T1", "S1", "S2", DAY1),
      new ConnectionId("T2", "S2", "S3", DAY1),
      new ConnectionId("T3", "S3", "S4", DAY1.plus({ days: 1 })),
    ],
    zoom: DEFAULTS.zoom,
    center: DEFAULTS.center,
  });
});

test("Create empty url", async () => {
  const searchParams = fillURLParams();
  expect(searchParams.toString()).toStrictEqual("");
});

test("Create url without connection", async () => {
  const searchParams = fillURLParams("S1", "S2", DAY1);

  const exp = "from=S1&to=S2&date=2024-10-15";
  expect(searchParams.toString()).toStrictEqual(exp);
});

test("Create url with one connection", async () => {
  const active = _i(["T1: S1@D1T10->S2@D1T11"]);
  const searchParams = fillURLParams("S1", "S2", DAY1, active);

  const c1 = "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15";
  const exp = "from=S1&to=S2&date=2024-10-15&" + c1;
  expect(searchParams.toString()).toStrictEqual(exp);
});

test("Create url with multiple connections", async () => {
  const active = _i([
    "T1: S1@D1T10->S2@D1T11",
    "T2: S2@D1T10->S3@D2T11",
    "T3: S3@D2T13->S4@D2T17",
  ]);
  const searchParams = fillURLParams("S1", "S4", DAY1, active);

  const c1 = "trip-id=T1&trip-from=S1&trip-to=S2&trip-date=2024-10-15";
  const c2 = "trip-id=T2&trip-from=S2&trip-to=S3&trip-date=2024-10-15";
  const c3 = "trip-id=T3&trip-from=S3&trip-to=S4&trip-date=2024-10-16";
  const exp = "from=S1&to=S4&date=2024-10-15&" + c1 + "&" + c2 + "&" + c3;
  expect(searchParams.toString()).toStrictEqual(exp);
});
