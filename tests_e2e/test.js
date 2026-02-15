describe("Mocha Example", () => {
  it("using visual matchers to assert against baseline", async () => {
    await browser.url("http://localhost:8000?start=Berlin");

    const button = await $("dialog button");
    await button.click();

    const from = await $("#config-from");
    await expect(await from.getAttribute("value")).toBe("Berlin");
  });
});
