import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    target: "es2015",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          rooms: [
            "./src/lib/components/rooms/RoomZensai.svelte",
            "./src/lib/components/rooms/RoomTsukuri.svelte",
            "./src/lib/components/rooms/RoomYakimono.svelte",
            "./src/lib/components/rooms/RoomOrizuru.svelte",
          ],
        },
      },
    },
  },

  optimizeDeps: {
    include: ["@supabase/supabase-js"],
  },
});
