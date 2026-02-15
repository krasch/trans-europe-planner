export const config = {
  runner: "local",

  specs: ["./tests_e2e/**/*.js"],

  capabilities: [
    {
      browserName: "firefox",
    },
  ],

  framework: "mocha",
  logLevel: "info",
};
