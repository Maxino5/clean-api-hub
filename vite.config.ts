import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

// Standard Vite config for TanStack Start on Vercel.
// Previously this used @lovable.dev/vite-tanstack-config, which wrapped
// tanstackStart + nitro + viteReact + tailwindcss + tsConfigPaths behind one
// call. This does the same thing explicitly so the project has no dependency
// on Lovable's tooling. Nitro auto-detects the Vercel build environment and
// applies the correct output preset, so no manual preset is needed here.
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
      server: { entry: "server" },
    }),
    nitro(),
    // React's Vite plugin must come after TanStack Start's plugin.
    viteReact(),
  ],
});
