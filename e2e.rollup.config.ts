import defineConfig from "./vite.config";

export default defineConfig((config) => {
  return {
    // ... Rest of the configuration...

    build: {
      // Enable Rollup watcher @see https://vitejs.dev/config/#build-watch
      watch: {},

      // Opt for the fastest build
      target: "esnext",
      minify: false,
      rollupOptions: { ...config!.build!.rollupOptions, treeshake: false },

      outDir: "./dist-rollup/"
    }
  };
});
