import { test, expect } from "vitest";

import { State, StateError } from "../script/state.js";
import {
  itineraryFromShortHand as _i,
  connectionFromShorthand as _c,
  DAY1,
} from "./_helpers/data.js";

test("initialization", async function () {
  const state = new State("C1", DAY1);

  expect(state.homeCityId).toBe("C1");
  expect(state.desiredStartDate).toBe(DAY1);
  expect(state.activeItinerary).toBe(null);
  expect(state.otherItineraries).toStrictEqual([]);
});

test("replaceItinerariesDuplicate", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);
  const i2 = _i(["T2: S1@D2T10->S2@D2T11"]);

  const state = new State("C1", DAY1);
  expect(() => state.replaceItineraries([i1, i2])).toThrow(StateError);
});

test("replaceItinerariesWithoutSettingActive", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);
  const i2 = _i(["T2: S2@D2T10->S3@D2T11"]);

  const state = new State("C1", DAY1);
  state.replaceItineraries([i1, i2], false);

  expect(state.activeItinerary).toBe(null);
  expect(state.otherItineraries).toStrictEqual([i1, i2]);
});

test("setActiveItineraryUnknown", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);

  const state = new State("C1", DAY1);
  state.replaceItineraries([i1], false);

  expect(() => state.setActiveItinerary("ladida")).toThrow(StateError);
});

test("setActiveItineraryNoPreviouslyActive", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);
  const i2 = _i(["T2: S2@D2T10->S3@D2T11"]);

  const state = new State("C1", DAY1);
  state.replaceItineraries([i1, i2], false);
  state.setActiveItinerary(i1.id);

  expect(state.activeItinerary).toBe(i1);
  expect(state.otherItineraries).toStrictEqual([i2]);
});

test("setActiveItineraryPreviouslyActive", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);
  const i2 = _i(["T2: S2@D2T10->S3@D2T11"]);

  const state = new State("C1", DAY1);
  state.replaceItineraries([i1, i2], false);
  state.setActiveItinerary(i1.id);
  state.setActiveItinerary(i2.id);

  expect(state.activeItinerary).toBe(i2);
  expect(state.otherItineraries).toStrictEqual([i1]);
});

test("setActiveItineraryPreviouslyActiveSame", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);
  const i2 = _i(["T2: S2@D2T10->S3@D2T11"]);

  const state = new State("C1", DAY1);
  state.replaceItineraries([i1, i2], false);
  state.setActiveItinerary(i1.id);
  state.setActiveItinerary(i1.id);

  expect(state.activeItinerary).toBe(i1);
  expect(state.otherItineraries).toStrictEqual([i2]);
});

test("replaceItinerariesAndSetActive", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);
  const i2 = _i(["T2: S2@D2T10->S3@D2T11"]);

  const state = new State("C1", DAY1);
  state.replaceItineraries([i1, i2], true);

  expect(state.activeItinerary).toBe(i1);
  expect(state.otherItineraries).toStrictEqual([i2]);
});

test("replaceLegNoActiveItinerary", async function () {
  const replacement = _c("T1: S1@D1T10->S2@D1T11");
  const state = new State("C1", DAY1);

  expect(() => state.replaceLegInActiveItinerary(replacement)).toThrow(
    StateError,
  );
});

test("replaceLegNotPartOfActiveItinerary", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11", "T2: S2@D1T11->S3@D1T12"]);
  const replacement = _c("T3: S3@D1T10->S4@D1T11");

  const state = new State("C1", DAY1);
  state.replaceItineraries([i1], true);

  expect(() => state.replaceLegInActiveItinerary(replacement)).toThrow(
    StateError,
  );
});

test("replaceLeg", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11", "T2: S2@D1T11->S3@D1T12"]);
  const replacement = _c("T3: S2@D1T10->S3@D1T11");

  const state = new State("C1", DAY1);
  state.replaceItineraries([i1], true);
  state.replaceLegInActiveItinerary(replacement);

  expect(state.activeItinerary.connections).toStrictEqual([
    i1.connections[0],
    replacement,
  ]);
});
