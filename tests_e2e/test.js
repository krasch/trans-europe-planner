import { MOTIS_URL } from "../app/config.js";

const baseURL = "http://localhost:8000";

describe("Tests for loading state from URL parameters", () => {
  it("should load an itinerary with two connections", async () => {
    console.log(MOTIS_URL + "/api/v5/stoptimes");

    const mock = await browser.mock(MOTIS_URL + "/api/v5/stoptimes", {
      method: "GET",
    });
    mock.abort("Failed");
    /*mock.respond((request) => {
      console.log(request);
    });*/
    console.log("HALLO234");

    const url = new URL(baseURL);

    /*url.searchParams.append("from", "de_de:13073:10401");
    url.searchParams.append("to", "de_de:13003:1489_G");
    url.searchParams.append("date", "20260323");
    url.searchParams.append("trip-id", "20260323_08:04_de_3070215378");
    url.searchParams.append("trip-from", "de_de:13073:10401");
    url.searchParams.append("trip-to", "de_de:13071:80001");
    url.searchParams.append("trip-id", "20260323_08:34_de_3070215261");
    url.searchParams.append("trip-from", "de_de:13071:80001");
    url.searchParams.append("trip-to", "de_de:13003:1489_G");*/

    await browser.url(url.toString());

    const from = await $("#config-from");
    const to = await $("#config-to");
    const date = await $("#config-date");

    await from.waitUntil(() => from.getValue() !== null, {
      timeout: 10000,
    });

    await expect(await from.getValue()).toBe("Stralsund Hauptbahnhof");
    await expect(await to.getValue()).toBe("Rostock Hauptbahnhof");
    await expect(await date.getValue()).toBe("2026-03-23");

    const calendar = await $("travel-calendar");
    await expect(calendar).toHaveChildren(19);
  });
});
