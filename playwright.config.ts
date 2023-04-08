import { defineConfig } from "@playwright/test";

export default defineConfig({
  workers: 1, // our test run into each other, but I haven't looked into why
  //globalSetup: require.resolve("./e2e/globalSetup"),
  testMatch: /.*\.e2e\.ts/,
  use: {
    channel: "msedge",
    /* none of this works. grr */
    viewport: {
      width: 1920,
      height: 1080
    },
    browserName: "chromium",
    launchOptions: {
      args: [
        "--start-fullscreen false --window-size=1920,1080 --window-position=4000,0"
      ] // chromium flag
    }
  }
});
