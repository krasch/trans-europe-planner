import { test, expect } from "./fixture.js";

const C1 = "27, 158, 119";
const C2 = "217, 95, 2";

const STOPS = {
  stralsund: "de-DELFI_de:13073:10401_G",
  schwerin: "de-DELFI_de:13004:9005",
};

const NAMES = {
  stralsund: "Stralsund Hauptbahnhof",
  rostock: "Rostock Hauptbahnhof",
  schwerin: "Schwerin Hauptbahnhof",
};

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("One long interaction", async ({ page }) => {
  const url = new URL("http://localhost:3000");
  url.searchParams.set("from", STOPS.stralsund);
  url.searchParams.set("to", STOPS.schwerin);
  url.searchParams.set("calStart", "2026-05-24");

  await page.goto(url.toString());
  await timeout(5000); // enough time to render (important for screenshot)

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

  await expect(loc.from).toHaveValue(NAMES.stralsund);
  await expect(loc.to).toHaveValue(NAMES.schwerin);
  await expect(loc.date).toHaveValue("2026-05-24");

  await expect(loc.cal.all).toHaveCount(84);
  await expect(loc.cal.active).toHaveCount(2);
  await expect(loc.cal.inactive).toHaveCount(82);
  await expect(loc.cal.active).allToBeVisible();
  await expect(loc.cal.inactive).allToBeHidden();
  await expect(loc.cal.active.nth(0)).toHaveCSS("--color", C1);
  await expect(loc.cal.active.nth(1)).toHaveCSS("--color", C2);
  await expect(loc.cal.activeStart.nth(0)).toContainText(NAMES.stralsund);
  await expect(loc.cal.activeDest.nth(0)).toContainText(NAMES.rostock);
  await expect(loc.cal.activeStart.nth(1)).toContainText(NAMES.rostock);
  await expect(loc.cal.activeDest.nth(1)).toContainText(NAMES.schwerin);

  await expect(loc.perl.connections).toHaveCount(2);
  await expect(loc.perl.transfers).toHaveCount(1);
  await expect(loc.perl.connections.nth(0)).toHaveCSS("--color", C1);
  await expect(loc.perl.connections.nth(1)).toHaveCSS("--color", C2);
  await expect(loc.perl.connections.nth(0)).toContainText(NAMES.stralsund);
  await expect(loc.perl.connections.nth(0)).toContainText(NAMES.rostock);
  await expect(loc.perl.connections.nth(1)).toContainText(NAMES.rostock);
  await expect(loc.perl.connections.nth(1)).toContainText(NAMES.schwerin);

  await expect(page).toHaveScreenshot("map1.png", {
    stylePath: "tests_e2e/mapScreenshot.css",
  });

  // *******************************************
  // click on grey line in map -> change route
  // *******************************************
  await page.mouse.click(709, 369);
  await timeout(1000); // again to be ready for screenshots

  await expect(loc.cal.all).toHaveCount(5);
  await expect(loc.cal.active).toHaveCount(1);
  await expect(loc.cal.inactive).toHaveCount(4);
  await expect(loc.cal.active).allToBeVisible();
  await expect(loc.cal.inactive).allToBeHidden();
  await expect(loc.cal.active.nth(0)).toHaveCSS("--color", C1);
  await expect(loc.cal.activeStart.nth(0)).toContainText(NAMES.stralsund);
  await expect(loc.cal.activeDest.nth(0)).toContainText(NAMES.schwerin);

  await expect(loc.perl.connections).toHaveCount(1);
  await expect(loc.perl.transfers).toHaveCount(0);
  await expect(loc.perl.connections.nth(0)).toHaveCSS("--color", C1);
  await expect(loc.perl.connections.nth(0)).toContainText(NAMES.stralsund);
  await expect(loc.perl.connections.nth(0)).toContainText(NAMES.schwerin);

  await expect(page).toHaveScreenshot("map2.png", {
    stylePath: "tests_e2e/mapScreenshot.css",
  });

  // *******************************************
  // click again to change back
  // *******************************************
  await page.mouse.click(568, 460);
  await timeout(1000); // again to be ready for screenshots

  await expect(loc.cal.all).toHaveCount(84);
  await expect(loc.perl.connections).toHaveCount(2);
  await expect(page).toHaveScreenshot("map1.png", {
    stylePath: "tests_e2e/mapScreenshot.css",
  });
});
