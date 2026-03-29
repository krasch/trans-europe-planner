// @ts-expect-error TS2416 - deliberately not configured in tsconfig.json, otherwise lots of type errors
import { DateTime as LuxonDateTime } from "external/luxon@3.5.0/luxon.min.js";

// totally hacky way of getting some type annotations for the luxon bits we need
// centralising this here also has the added benefit that
// * only need to specify the exact version/path of luxon once
// * only need to do the ts-expect-error (see above) once
export class DateTime extends LuxonDateTime {
  diff = super.diff;
  plus = super.plus;
  startOf = super.startOf;
  static fromISO = super.fromISO;
  toISO = super.toISO;
  toISODate = super.toISODate;
  toFormat = super.toFormat;
  toLocaleString = super.toLocaleString;
  hour = super.hour;
  minute = super.minute;
  static now = LuxonDateTime.now;
}
