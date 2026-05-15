import { writable, derived } from "svelte/store";
import { supabase, getVisitorId } from "$lib/supabase.js";

export const presenceMap = writable({});
export const otherVisitors = derived(presenceMap, ($map) => {
  const me =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem("tsukiyo_visitor")
      : null;
  return Object.entries($map)
    .filter(([id]) => id !== me)
    .map(([id, state]) => state);
});
export const hasOtherVisitor = derived(otherVisitors, ($v) => $v.length > 0);

let presenceChannel;

export async function initPresence(currentRoom = 0) {
  const visitorId = getVisitorId();

  presenceChannel = supabase.channel("tsukiyo_presence", {
    config: { presence: { key: visitorId } },
  });

  presenceChannel
    .on("presence", { event: "sync" }, () => {
      const state = presenceChannel.presenceState();

      const flat = {};
      for (const [key, arr] of Object.entries(state)) {
        if (arr[0]) flat[key] = arr[0];
      }
      presenceMap.set(flat);
    })
    .on("presence", { event: "join" }, ({ key, newPresences }) => {
      presenceMap.update((m) => ({ ...m, [key]: newPresences[0] }));
    })
    .on("presence", { event: "leave" }, ({ key }) => {
      presenceMap.update((m) => {
        const next = { ...m };
        delete next[key];
        return next;
      });
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({
          room: currentRoom,
          joinedAt: new Date().toISOString(),
        });
      }
    });

  return presenceChannel;
}

export async function updatePresenceRoom(roomIdx) {
  if (!presenceChannel) return;
  await presenceChannel.track({
    room: roomIdx,
    joinedAt: new Date().toISOString(),
  });
}

export function destroyPresence() {
  if (presenceChannel) supabase.removeChannel(presenceChannel);
}
