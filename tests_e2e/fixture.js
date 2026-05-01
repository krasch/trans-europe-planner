import { test as base } from "@playwright/test";

function configurePrintLogs(page) {
  const ignore = [
    "Unable to load glyph range",
    "Could not parse color from value 'null'",
    "Alpha-premult and y-flip are deprecated",
    "no further warnings will be reported for this WebGL context.",
  ];

  page.on("console", (msg) => {
    // if any ignored strings are in the event, return and don't print event
    for (let i of ignore) {
      if (msg["_event"]["text"].includes(i)) return;
    }
    if (msg["_event"]["location"]["url"].includes("maplibre-gl.js")) return;

    console.log(msg["_event"]);
  });
}

async function fulfillFromFile(page, url, file) {
  return page.route(url, (route) => route.fulfill({ path: file }));
}

async function configureMockMotis(page) {
  const stops = {
    stralsund: "de-DELFI_de%3A13073%3A10401_G",
    rostock: "de-DELFI_de%3A13003%3A1489_G",
    schwerin: "de-DELFI_de%3A13004%3A9005",
  };

  const plan = { from: "stralsund", to: "schwerin" };

  const direct = [
    { from: "stralsund", to: "schwerin" },
    { from: "stralsund", to: "rostock" },
    { from: "rostock", to: "schwerin" },
  ];

  for (let stop of ["stralsund", "schwerin"]) {
    await fulfillFromFile(
      page,
      `**stoptimes?stopId=${stops[stop]}&n=1`,
      `tests_e2e/motis_data/stoptimes/${stop}.json`,
    );
  }

  // we can have both plan and direct with the same from&to
  // the only difference in the url is maxTransfers=0 for the direct
  // by registering plan (i.e. not direct) first, it will be hit last,
  // -> for direct it will already hit on the URL set up in upcoming block
  await fulfillFromFile(
    page,
    `**plan?fromPlace=${stops[plan.from]}&toPlace=${stops[plan.to]}**`,
    `tests_e2e/motis_data/plan/${plan.from}->${plan.to}.json`,
  );

  for (let route of direct) {
    await fulfillFromFile(
      page,
      `**plan?fromPlace=${stops[route.from]}&toPlace=${stops[route.to]}**&maxTransfers=0**`,
      `tests_e2e/motis_data/direct/${route.from}->${route.to}.json`,
    );
  }
}

async function configureAbortNetworkRequests(page) {
  // fallback, registered first -> used last
  await page.route(
    (url) => {
      const notLocalhost = !url.href.includes("localhost");
      if (notLocalhost) console.error("Unexpected network access: ", url.href);
      return notLocalhost;
    },
    (route) => route.fulfill({ status: 400 }),
  );

  await page.route(
    (url) => url.href.includes("plausible.io"),
    (route) => route.fulfill({ body: "" }),
  );

  await page.route(
    (url) => url.href.includes("openmaptiles.json"),
    (route) => route.fulfill({ json: { tiles: ["t/{z}/{x}/{y}.pbf"] } }),
  );

  await page.route(
    (url) => url.href.includes("sprite.json"),
    (route) => route.fulfill({ json: {} }),
  );

  await page.route(
    (url) => url.href.includes("sprite.png"),
    (route) => route.fulfill({ body: "" }),
  );

  await page.route(
    (url) => url.href.includes(".pbf"),
    (route) => route.fulfill({ body: "" }),
  );
}

export const test = base.extend({
  page: async ({ page }, use) => {
    // these are run before every test
    configurePrintLogs(page);
    await configureAbortNetworkRequests(page); // must be run first to be evaluated last
    await configureMockMotis(page);

    await use(page); //runs test here
  },
});
export const expect = base.expect.extend({
  allToBeVisible: async (received) => {
    const items = await received.all();
    for (let e of items) await expect(e).toBeVisible();
    return { message: () => "passed", pass: true };
  },
  allToBeHidden: async (received) => {
    const items = await received.all();
    for (let e of items) await expect(e).toBeHidden();
    return { message: () => "passed", pass: true };
  },
});
