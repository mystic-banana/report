import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tempo } from "tempo-devtools/dist/vite"; // Add this import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tempo(), // Add the tempo plugin
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
});
