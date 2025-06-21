import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    target: "esnext",
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  define: {
    // Ensure environment variables are available at build time
    "import.meta.env.VITE_FIREBASE_API_KEY": JSON.stringify(
      process.env.VITE_FIREBASE_API_KEY
    ),
    "import.meta.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(
      process.env.VITE_FIREBASE_AUTH_DOMAIN
    ),
    "import.meta.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_FIREBASE_PROJECT_ID
    ),
    "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(
      process.env.VITE_FIREBASE_STORAGE_BUCKET
    ),
    "import.meta.env.VITE_FIREBASE_MESSAGING_ID": JSON.stringify(
      process.env.VITE_FIREBASE_MESSAGING_ID
    ),
    "import.meta.env.VITE_FIREBASE_APP_ID": JSON.stringify(
      process.env.VITE_FIREBASE_APP_ID
    ),
  },
});
