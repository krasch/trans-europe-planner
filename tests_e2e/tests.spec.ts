import { test, expect } from "./fixture.js";

const COLORS = ["27, 158, 119", "217, 95, 2"];

const STOPS = {
  stralsund: "de-DELFI_de:13073:10401_G",
  schwerin: "de-DELFI_de:13004:9005",
};

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function expectPage(page, exp) {
  const loc = {
    from: page.locator("#config-from"),
    to: page.locator("#config-to"),
    date: page.locator("#config-date"),
    cal: {
      // these all pierce into the shadow root
      all: page.locator(".entry-part"),
      active: page.locator('.entry-part[data-status="active"]'),
      inactive: page.locator('.entry-part:not([data-status="active"])'),
      activeStart: page.locator('.entry-part[data-status="active"] .start'),
      activeDest: page.locator(
        '.entry-part[data-status="active"] .destination',
      ),
    },
    perl: {
      connections: page.locator(".perlschnur-connection"),
      transfers: page.locator(".perlschnur-transfer"),
    },
  };

  const stops = [exp.from].concat(exp.via).concat([exp.to]);

  // config form
  await expect(loc.from).toHaveValue(exp.from);
  await expect(loc.to).toHaveValue(exp.to);
  await expect(loc.date).toHaveValue(exp.calStartDate);

  // calendar
  // #entry-parts might be different than #connections (multi-day connections)
  await expect(loc.cal.all).toHaveCount(exp.calActive + exp.calInactive);
  await expect(loc.cal.active).toHaveCount(exp.calActive);
  await expect(loc.cal.inactive).toHaveCount(exp.calInactive);

  await expect(loc.cal.active).allToBeVisible();
  await expect(loc.cal.inactive).allToBeHidden();

  for (let i = 0; i < exp.active; i++) {
    await expect(loc.cal.active.nth(i)).toHaveCSS("--color", COLORS[i]);
  }

  for (let i = 0; i < exp.active; i++) {
    await expect(loc.cal.activeStart.nth(i)).toContainText(stops[i]);
    await expect(loc.cal.activeDest.nth(i)).toContainText(stops[i + 1]);
  }

  // perlschnur
  await expect(loc.perl.connections).toHaveCount(exp.via.length + 1);
  await expect(loc.perl.transfers).toHaveCount(exp.via.length);

  for (let i = 0; i < exp.active; i++) {
    await expect(loc.perl.connections.nth(i)).toHaveCSS("--color", COLORS[i]);
  }

  for (let i = 0; i < exp.active; i++) {
    await expect(loc.perl.connections.nth(i)).toContainText(stops[i]);
    await expect(loc.perl.connections.nth(i + 1)).toContainText(stops[i + 1]);
  }

  // map
  await timeout(1000);
  await expect(page).toHaveScreenshot(exp.mapScreenshot, {
    stylePath: "tests_e2e/mapScreenshot.css",
  });
}

test("One long interaction", async ({ page }) => {
  const expStralsundToSchwerinViaRostock = {
    from: "Stralsund Hauptbahnhof",
    to: "Schwerin Hauptbahnhof",
    via: ["Rostock Hauptbahnhof"],
    calStartDate: "2026-05-24",
    calActive: 2,
    calInactive: 82,
    mapScreenshot: "map1.png",
  };

  const expStralsundToSchwerinDirect = {
    from: "Stralsund Hauptbahnhof",
    to: "Schwerin Hauptbahnhof",
    via: [],
    calStartDate: "2026-05-24",
    calActive: 1,
    calInactive: 4,
    mapScreenshot: "map2.png",
  };

  const url = new URL("http://localhost:3000");
  url.searchParams.set("from", STOPS.stralsund);
  url.searchParams.set("to", STOPS.schwerin);
  url.searchParams.set("calStart", "2026-05-24");

  // *******************************************
  // load data from url
  // *******************************************
  await page.goto(url.toString());
  await expectPage(page, expStralsundToSchwerinViaRostock);

  // *******************************************
  // click on grey line in map -> change route
  // *******************************************
  await page.mouse.click(709, 369);
  await expectPage(page, expStralsundToSchwerinDirect);

  // *******************************************
  // click again to change back
  // *******************************************
  await page.mouse.click(568, 460);
  await expectPage(page, expStralsundToSchwerinViaRostock);
});
