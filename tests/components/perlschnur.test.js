/**
 * @vitest-environment jsdom
 */
import { beforeEach, test, expect } from "vitest";

import { Perlschnur } from "script/components/perlschnur.js";

import { initTestDOM, timeout } from "tests/_helpers/domUtils.js";

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
  stops: (conn) => conn.querySelector(".perlschnur-stop-list").children,
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
  expect(domElements.stops(connections[0])).toMatchDOMObjectList([
    _stop("(15 Oct)", "10:01", "S1", "Stop1"),
    { selectors: { ".count": { innerText: 1 } } }, // collapse
    _stop("", "11:00", "S2", "Stop2"),
    _stop("", "12:00", "S3", "Stop3"),
  ]);

  // stops for connection 2
  expect(domElements.stops(connections[1])).toMatchDOMObjectList([
    _stop("", "13:01", "S3", "Stop3"),
    _stop("", "14:00", "S4", "Stop4"),
  ]);

  // stops for connection 3
  expect(domElements.stops(connections[2])).toMatchDOMObjectList([
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
  expect(domElements.stops(connections[0])).toMatchDOMObjectList([
    _stop("(15 Oct)", "13:01", "S3", "Stop3"),
    _stop("", "14:00", "S4", "Stop4"),
  ]);

  // transfers
  expect(domElements.transfers().length).toBe(0);
});
