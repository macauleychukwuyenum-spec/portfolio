import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Nitro picks the hosting target: it auto-detects Vercel when building there,
// otherwise builds a Node server. Override with NITRO_PRESET (e.g. node-server, vercel).
// `--mode development` (the build:dev script used by Lovable hosting) writes a
// Cloudflare Worker build into dist/; normal `npm run build` is unchanged.
export default defineConfig(({ mode }) => ({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({ server: { entry: "server" } }),
    nitro(
      mode === "development"
        ? {
            preset: "cloudflare-module",
            output: { dir: "dist", publicDir: "dist/client", serverDir: "dist/server" },
          }
        : {},
    ),
    react(),
  ],
  resolve: { dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"] },
  server: { host: true, port: Number(process.env["PORT"]) || 3000 },
}));
