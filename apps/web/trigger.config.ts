import { defineConfig, timeout } from "@trigger.dev/sdk/v3";
import { playwright } from "@trigger.dev/build/extensions/playwright";

export default defineConfig({
  project: "proj_bqawgowchnkryltmpgsv",
  runtime: "node",
  logLevel: "log",
  maxDuration: timeout.None,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  dirs: ["./trigger"],
  build: {
    // Marcar dependencias como externas para evitar bundling incorrecto
    external: [
      "playwright",
      "playwright-core",
      "chromium-bidi",
      "@playwright/test",
      "@supabase/supabase-js",
    ],
    extensions: [
      playwright({
        browsers: ["chromium"],
      }),
    ],
  },
});
