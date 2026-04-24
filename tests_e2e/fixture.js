import { test as base } from "@playwright/test";

function configurePrintLogs(page) {
  page.on("console", (msg) => {
    console.log(msg);
  });
}

async function configureMockMotis(page) {
  await page.route("**stoptimes?stopId=de-VBB_710008010381&n=1", (route) =>
    route.fulfill({
      path: "tests_e2e/motis_data/stoptimes/de-VBB_710008010381.json",
    }),
  );
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
}

export const test = base.extend({
  page: async ({ page }, use) => {
    // these are run before every test
    configurePrintLogs(page);
    await configureAbortNetworkRequests(page); // must be run first
    await configureMockMotis(page);

    await use(page); //runs test here
  },
});
export const expect = test.expect;
