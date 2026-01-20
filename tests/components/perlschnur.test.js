/**
 * @vitest-environment jsdom
 */
import { beforeEach, test, expect, vi } from "vitest";

import { Perlschnur } from "script/components/perlschnur.js";

import {
  dispatchTestEvent,
  initTestDOM,
  timeout,
} from "tests/_helpers/domUtils.js";

beforeEach(async () => {
  initTestDOM();
});

function _stop(date, time, stopId, stopName) {
  return {
    selectors: {
      ".time": { innerText: time },
      ".date": { innerText: date },
      ".station": { innerText: stopName },
    },
    dataset: { stopId: stopId },
  };
}

function _connection(id, icon, number, travelTime, color) {
  return {
    selectors: {
      ".connection-icon": { src: expect.stringMatching(icon) },
      ".connection-number": { innerText: number },
      ".connection-travel-time": { innerText: travelTime },
    },
    style: { "--color": color },
    dataset: { connectionId: id },
  };
}

const domElements = {
  perlschnur: () => document.querySelector("#perlschnur"),
  connections: () => document.querySelectorAll(".perlschnur-connection"),
  stopList: (conn) => conn.querySelector(".perlschnur-stop-list"),
  transfers: () => document.querySelectorAll(".perlschnur-transfer"),
};

test("update view should fill in all templates correctly", async function () {
  const data = [
    {
      id: "c1",
      color: "red",
      name: "ICE T1",
      icon: "REGIONAL_RAIL.svg",
      travelTime: "1h 59min",
      stops: [
        { stopId: "S1", stopName: "Stop1", time: "10:01", date: "(15 Oct)" },
        { stopId: "S2", stopName: "Stop2", time: "11:00", date: "" },
        { stopId: "S3", stopName: "Stop3", time: "12:00", date: "" },
      ],
      transferTime: "1h 1min",
    },
    {
      id: "c2",
      color: "green",
      name: "ICE T2",
      icon: "REGIONAL_RAIL.svg",
      travelTime: "59min",
      stops: [
        { stopId: "S3", stopName: "Stop3", time: "13:01", date: "" },
        { stopId: "S4", stopName: "Stop4", time: "14:00", date: "" },
      ],
      transferTime: "3h 1min",
    },
    {
      id: "c3",
      color: "blue",
      name: "ICE T3",
      icon: "REGIONAL_RAIL.svg",
      travelTime: "13h 59min",
      stops: [
        { stopId: "S4", stopName: "Stop4", time: "17:01", date: "" },
        { stopId: "S5", stopName: "Stop5", time: "07:00", date: "(16 Oct)" },
      ],
      transferTime: null,
    },
  ];

  const perlschnur = new Perlschnur(domElements.perlschnur());
  perlschnur.updateView(data);
  await timeout(10);

  // connections
  const connections = domElements.connections();
  expect(connections).toMatchDOMObjectList([
    _connection("c1", "RAIL.svg", "ICE T1", "1h 59min", "red"),
    _connection("c2", "RAIL.svg", "ICE T2", "59min", "green"),
    _connection("c3", "RAIL.svg", "ICE T3", "13h 59min", "blue"),
  ]);

  // stops for connection 1
  let stops = domElements.stopList(connections[0]).children;
  expect(stops).toMatchDOMObjectList([
    _stop("(15 Oct)", "10:01", "S1", "Stop1"),
    { selectors: { ".count": { innerText: 1 } } }, // collapse
    _stop("", "11:00", "S2", "Stop2"),
    _stop("", "12:00", "S3", "Stop3"),
  ]);

  // stops for connection 2
  stops = domElements.stopList(connections[1]).children;
  expect(stops).toMatchDOMObjectList([
    _stop("", "13:01", "S3", "Stop3"),
    _stop("", "14:00", "S4", "Stop4"),
  ]);

  // stops for connection 3
  stops = domElements.stopList(connections[2]).children;
  expect(stops).toMatchDOMObjectList([
    _stop("", "17:01", "S4", "Stop4"),
    _stop("(16 Oct)", "07:00", "S5", "Stop5"),
  ]);

  // transfers
  expect(domElements.transfers()).toMatchDOMObjectList([
    // transfer between c1 and c2
    { selectors: { ".transfer-time": { innerText: "1h 1min" } } },
    // transfer between c2 and c3
    { selectors: { ".transfer-time": { innerText: "3h 1min" } } },
  ]);
});

test("update view should update with new connection data", async function () {
  const data1 = [
    {
      id: "c1",
      color: "red",
      name: "ICE T1",
      icon: "REGIONAL_RAIL.svg",
      travelTime: "1h 59min",
      stops: [
        { stopId: "S1", stopName: "Stop1", time: "10:01", date: "(15 Oct)" },
        { stopId: "S2", stopName: "Stop2", time: "11:00", date: "" },
        { stopId: "S3", stopName: "Stop3", time: "12:00", date: "" },
      ],
      transferTime: null,
    },
  ];

  const data2 = [
    {
      id: "c2",
      color: "green",
      name: "ICE T2",
      icon: "REGIONAL_RAIL.svg",
      travelTime: "59min",
      stops: [
        { stopId: "S3", stopName: "Stop3", time: "13:01", date: "(15 Oct)" },
        { stopId: "S4", stopName: "Stop4", time: "14:00", date: "" },
      ],
      transferTime: null,
    },
  ];

  // initial update
  const perlschnur = new Perlschnur(domElements.perlschnur());
  perlschnur.updateView(data1);
  await timeout(10);

  // new data
  perlschnur.updateView(data2);
  await timeout(10);

  // connections
  const connections = domElements.connections();
  expect(connections).toMatchDOMObjectList([
    _connection("c2", "RAIL.svg", "ICE T2", "59min", "green"),
  ]);

  // stops
  const stops = domElements.stopList(connections[0]).children;
  expect(stops).toMatchDOMObjectList([
    _stop("(15 Oct)", "13:01", "S3", "Stop3"),
    _stop("", "14:00", "S4", "Stop4"),
  ]);

  // transfers
  expect(domElements.transfers().length).toBe(0);
});

test("hovering information should get transported into and out of element", async function () {
  const data = [
    {
      id: "c1",
      color: "red",
      name: "ICE T1",
      icon: "REGIONAL_RAIL.svg",
      travelTime: "1h 59min",
      stops: [
        { stopId: "S1", stopName: "Stop1", time: "10:01", date: "(15 Oct)" },
        { stopId: "S2", stopName: "Stop2", time: "11:00", date: "" },
        { stopId: "S3", stopName: "Stop3", time: "12:00", date: "" },
      ],
      transferTime: null,
    },
  ];

  const perlschnur = new Perlschnur(domElements.perlschnur());
  perlschnur.updateView(data);
  await timeout(10);

  const connection = domElements.connections()[0];
  const stops = domElements.stopList(connection).children;

  const connectionHoverCallback = vi.fn();
  const stopHoverCallback = vi.fn();
  perlschnur.on("connectionHover", connectionHoverCallback);
  perlschnur.on("stopHover", stopHoverCallback);

  // hovering over stop (inside connection) triggers stop + connection callbacks
  await dispatchTestEvent(stops[2], "mouseover");
  expect(stopHoverCallback).toHaveBeenCalledWith("S2", true);
  expect(connectionHoverCallback).toHaveBeenCalledWith("c1", true);
  vi.resetAllMocks();

  // same for no longer hovering over a stop
  await dispatchTestEvent(stops[2], "mouseout");
  expect(stopHoverCallback).toHaveBeenCalledWith("S2", false);
  expect(connectionHoverCallback).toHaveBeenCalledWith("c1", false);
  vi.resetAllMocks();

  // hover over a connection and not a stop triggers only connection callback
  await dispatchTestEvent(connection, "mouseover");
  expect(connectionHoverCallback).toHaveBeenCalledWith("c1", true);
  vi.resetAllMocks();

  // same for no longer hovering over a connection
  await dispatchTestEvent(connection, "mouseout");
  expect(connectionHoverCallback).toHaveBeenCalledWith("c1", false);
  vi.resetAllMocks();

  // from outside: setting unknown stop/connection to hover is ignored
  perlschnur.setStopHover("S4", true);
  perlschnur.setConnectionHover("c4", true);

  // from outside: set stop to hover/unhover
  perlschnur.setStopHover("S1", true);
  expect(Array.from(stops[0].classList)).contains("hover");
  perlschnur.setStopHover("S1", false);
  expect(Array.from(stops[0].classList)).not.contains("hover");

  // from outside: set connection to hover/unhover
  perlschnur.setConnectionHover("c1", true);
  expect(Array.from(connection.classList)).contains("hover");
  perlschnur.setConnectionHover("c1", false);
  expect(Array.from(connection.classList)).not.contains("hover");
});

test("clicking collapse should switch collapse status", async function () {
  const data = [
    {
      id: "c1",
      color: "red",
      name: "ICE T1",
      icon: "REGIONAL_RAIL.svg",
      travelTime: "1h 59min",
      stops: [
        { stopId: "S1", stopName: "Stop1", time: "10:01", date: "(15 Oct)" },
        { stopId: "S2", stopName: "Stop2", time: "11:00", date: "" },
        { stopId: "S3", stopName: "Stop3", time: "12:00", date: "" },
      ],
      transferTime: null,
    },
  ];

  const perlschnur = new Perlschnur(domElements.perlschnur());
  perlschnur.updateView(data);
  await timeout(10);

  const connection = domElements.connections()[0];
  const stopList = domElements.stopList(connection);

  // initial state
  expect(stopList.dataset.collapsed).toBe("collapsed");

  // expand
  dispatchTestEvent(stopList, "click");
  expect(stopList.dataset.collapsed).toBe("");

  // collapsed
  dispatchTestEvent(stopList, "click");
  expect(stopList.dataset.collapsed).toBe("collapsed");
});
