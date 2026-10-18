import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { sitePlugin } from "./build/site-plugin.js";
import { buildPublicConfig } from "./src/site.js";
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };
  return {
    plugins: [react(), sitePlugin(env)],
    define: { __MEDIDESK_SITE__: JSON.stringify(buildPublicConfig(env)) },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: process.env.MEDIDESK_API_TARGET || "http://127.0.0.1:5000",
          changeOrigin: true,
        },
      },
    },
  };
});
