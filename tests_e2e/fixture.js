import { test as base } from "@playwright/test";

function configurePrintLogs(page) {
  page.on("console", (msg) => {
    console.log(msg);
  });
}

async function configureAbortStadiamaps(page) {
  await page.route(
    (url) => url.href.includes("stadiamaps"),
    (route) =>
      route.fulfill({
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
        },
      }),
  );
}

async function configureMockMotis(page) {
  await page.route("**stoptimes?stopId=de-VBB_710008010381&n=1", (route) =>
    route.fulfill({
      path: "tests_e2e/motis_data/stoptimes/de-VBB_710008010381.json",
    }),
  );
}

export const test = base.extend({
  page: async ({ page }, use) => {
    // todo these are run before every test, bad?
    configurePrintLogs(page);
    await configureAbortStadiamaps(page);
    await configureMockMotis(page);
    // todo abort all other network requests?

    await use(page); //runs test here
  },
});
export const expect = test.expect;
