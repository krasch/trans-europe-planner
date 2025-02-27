// to get drag events
import("@atlaskit/pragmatic-drag-and-drop-unit-testing/drag-event-polyfill");

import { DateTime } from "/external/luxon@3.5.0/luxon.min.js";

export const ROW_MIDNIGHT = 2; // 1 for header, 1 because indexes start at 1
export const COLUMN_FIRST_DAY = 2; // 1 for hour column, 1 because indexes start at 1
export const DATES = ["2024-10-15", "2024-10-16", "2024-10-17"];

// quickly create datetime strings for dates 1, 2, 3
export const t1 = (timeStr) => `${DATES[0]}T${timeStr}`;
export const t2 = (timeStr) => `${DATES[1]}T${timeStr}`;
export const t3 = (timeStr) => `${DATES[2]}T${timeStr}`;

export const createEntry = (startDateTime, endDateTime, kwargs = {}) => {
  const template = document.getElementById("template-calendar-connection");
  const e = template.content.firstElementChild.cloneNode(true);

  e.dataset.departureDatetime = startDateTime;
  e.dataset.arrivalDatetime = endDateTime;
  e.dataset.color = kwargs.color ?? "test-color";
  e.dataset.active = kwargs.active ?? "inactive";
  e.dataset.group = kwargs.group ?? "default-group";

  e.querySelector(".connection-icon").src = "train.svg";
  e.querySelector(".connection-number").innerHTML =
    kwargs.connectionNumber ?? "test-connection-number";
  e.querySelector(".start .time").innerHTML =
    DateTime.fromISO(startDateTime).toFormat("HH:mm");
  e.querySelector(".start .station").innerHTML =
    kwargs.startStation ?? "start-station";
  e.querySelector(".destination .time").innerHTML =
    DateTime.fromISO(endDateTime).toFormat("HH:mm");
  e.querySelector(".destination .station").innerHTML =
    kwargs.endStation ?? "end-station";

  return e;
};
