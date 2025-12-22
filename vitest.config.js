import * as path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      external: path.resolve(__dirname, "./external"),
      script: path.resolve(__dirname, "./script"),
      tests: path.resolve(__dirname, "./tests"),
    },
  },
});
