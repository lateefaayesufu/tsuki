import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || "YOUR_ANON_KEY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});

export function getVisitorId() {
  if (typeof sessionStorage === "undefined") return "server";
  let id = sessionStorage.getItem("tsukiyo_visitor");
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    sessionStorage.setItem("tsukiyo_visitor", id);
  }
  return id;
}
