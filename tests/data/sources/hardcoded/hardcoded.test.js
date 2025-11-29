import { HardcodedConnectionDatabase } from "script/data/sources/hardcoded.js";

import { DAY1, connectionFromShorthand as _c } from "tests/_helpers/data.js";
import {
  initGeoDatabase,
  hardcodedConnectionDataFromShorthand,
} from "tests/data/sources/hardcoded/data.js";

/**
 * @param {string[]} connectionShorthands
 * @returns HardcodedConnectionDatabase
 */
function initConnectionDatabase(connectionShorthands) {
  const connections = connectionShorthands.map(
    hardcodedConnectionDataFromShorthand,
  );
  return new HardcodedConnectionDatabase(connections, [], initGeoDatabase());
}

test("Direct", async function () {
  const db = initConnectionDatabase(["T1: S1@D10->S2@T11->S3@T12"]);

  const exp = [_c("T1: S1@D1T10->S2@D1T11")];
  const got = await db.direct("C1", "C2", DAY1, initGeoDatabase());
  expect(got).toStrictEqual(exp);
});
