import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    port: 3000,
    fs: {
      strict: true,
    },
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    sourcemap: true,
    target: "esnext",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      external: [
        "recharts",
        "react-globe.gl",
        "@react-three/fiber",
        "@react-three/drei",
        "three",
      ],
      output: {
        globals: {
          recharts: "Recharts",
          "react-globe.gl": "ReactGlobe",
          "@react-three/fiber": "ReactThreeFiber",
          "@react-three/drei": "ReactThreeDrei",
          three: "THREE",
        },
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      extensions: [".js", ".cjs", ".ts", ".tsx"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "recharts"],
  },
  publicDir: "public",
  esbuild: {
    loader: "tsx",
    include: /src\/.*\.[tj]sx?$/,
    exclude: [],
  },
});
