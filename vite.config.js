import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const cleanHeaders = (proxy) => {
  proxy.on("proxyReq", (proxyReq) => {
    proxyReq.removeHeader("origin");
    proxyReq.removeHeader("referer");
    proxyReq.setHeader("AIC-User-Agent", "my-expo-college-project (student)");
  });
};

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "^/aic/": {
        target: "https://api.artic.edu",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aic/, ""),
        configure: cleanHeaders,
      },
      "/aicimg": {
        target: "https://www.artic.edu",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/aicimg/, ""),
        configure: cleanHeaders,
      },
    },
  },
});