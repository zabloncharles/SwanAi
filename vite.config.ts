import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [
        "recharts",
        "react-globe.gl",
        "@react-three/fiber",
        "@react-three/drei",
        "three",
      ],
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: [".js", ".cjs", ".ts", ".tsx"],
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  esbuild: {
    loader: "tsx",
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
  server: {
    fs: {
      strict: true,
    },
  },
});
