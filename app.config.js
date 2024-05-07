import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  start: {
    ssr: true,
    server: {
      baseURL: process.env.BASE_PATH,
      preset: "static"
    }
  }
});
