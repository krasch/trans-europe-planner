export const config = {
  runner: "local",

  specs: ["./tests_e2e/**/*.js"],
  reporters: ["dot", "spec"],

  capabilities: [
    {
      browserName: "firefox",
      "moz:firefoxOptions": {
        args: ["-headless"],
      },
    },
  ],

  framework: "mocha",
  logLevel: "error",

  /*reporters: [
    [
      "spec",
      {
        addConsoleLogs: true,
      },
    ],
  ],*/
};
