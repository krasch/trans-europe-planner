import { webdriverio } from "@vitest/browser-webdriverio";
import * as path from "node:path";
import { defineConfig } from "vitest/config";

const aliases = {
  external: path.resolve(__dirname, "./external"),
  script: path.resolve(__dirname, "./script"),
  tests: path.resolve(__dirname, "./tests"),
  "style/planner/components/map/layers.js": path.resolve(
    __dirname,
    "./style/planner/components/map/layers.js",
  ),
};

const browserTests = ["tests/**/*.browser.test.js"];

export default defineConfig({
  test: {
    // globalSetup: ["./tests/setup.js"],
    projects: [
      {
        resolve: { alias: aliases },
        test: {
          name: "unit",
          environment: "node",
          include: "tests/**/*.test.js",
          exclude: browserTests,
        },
      },
      {
        resolve: { alias: aliases },
        test: {
          name: "browser",
          include: browserTests,
          browser: {
            provider: webdriverio(),
            enabled: true,
            headless: true,
            instances: [{ browser: "firefox" }],
            screenshotFailures: false,
          },
        },
      },
    ],
  },
});
