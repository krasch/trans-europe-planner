import { test, expect } from "vitest";

import { State, StateError } from "../script/state.js";
import { itineraryFromShortHand as _i } from "./_helpers/data.js";

test("replaceItinerariesDuplicate", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);
  const i2 = _i(["T2: S1@D2T10->S2@D2T11"]);

  const state = new State();
  expect(() => state.replaceItineraries([i1, i2])).toThrow(StateError);
});

test("replaceItineraries", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);
  const i2 = _i(["T2: S2@D2T10->S3@D2T11"]);

  const state = new State();
  state.replaceItineraries([i1, i2]);

  expect(state.activeItinerary).toBe(i1);
  expect(state.otherItineraries).toStrictEqual([i2]);
});

test("setActiveItineraryUnknown", async function () {
  const state = new State();
  expect(() => state.setActiveItinerary("ladida")).toThrow(StateError);
});

test("changeActiveItinerary", async function () {
  const i1 = _i(["T1: S1@D1T10->S2@D1T11"]);
  const i2 = _i(["T2: S2@D2T10->S3@D2T11"]);

  const state = new State();
  state.replaceItineraries([i1, i2]);
  state.setActiveItinerary(i1.id);
  state.setActiveItinerary(i2.id);

  expect(state.activeItinerary).toBe(i2);
  expect(state.otherItineraries).toStrictEqual([i1]);
});
