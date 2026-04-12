import { connectionFromShorthand as _c } from "./data.js";
import { TEST_DOM } from "./domUtils.js";

export const ROW_MIDNIGHT = 2; // 1 for header, 1 because indexes start at 1
export const COLUMN_FIRST_DAY = 2; // 1 for header, 1 because indexes start at 1

export async function addEntryToCalendar(connectionShorthand, kwargs = {}) {
  const connection = _c(connectionShorthand);
  const template = document.getElementById("template-calendar-connection");

  // @ts-expect-error TS2339
  const entry = template.content.firstElementChild.cloneNode(true);
  entry.dataset.color = kwargs.color ?? "test-color";
  entry.dataset.status = kwargs.status ?? "inactive";

  entry.dataset.group = `${connection.from.stop.id}->${connection.to.stop.id}`;
  entry.dataset.departureDatetime = connection.from.departure.toISO();
  entry.dataset.arrivalDatetime = connection.to.arrival.toISO();

  entry.querySelector(".connection-icon").src = "train.svg";
  entry.querySelector(".connection-number").innerHTML =
    connection.id.toString();
  entry.querySelector(".start .time").innerHTML =
    connection.from.departure.toFormat("HH:mm");
  entry.querySelector(".start .station").innerHTML = connection.to.stop.name;
  entry.querySelector(".destination .time").innerHTML =
    connection.to.arrival.toFormat("HH:mm");
  entry.querySelector(".destination .station").innerHTML =
    connection.to.stop.name;

  await TEST_DOM.calendar.appendChild(entry);
  return entry;
}
