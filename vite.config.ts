import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
        "@components": resolve(__dirname, "./src/components"),
        "@pages": resolve(__dirname, "./src/pages"),
        "@assets": resolve(__dirname, "./src/assets"),
        "@router": resolve(__dirname, "./src/router")
      }
    },
    build: {
      target: "es2022",
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            router: ["react-router-dom"]
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"]
    },
    server: {
      port: 3000,
      open: true
    }
  };
});
