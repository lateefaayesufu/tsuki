import { writable, get } from "svelte/store";
import { supabase } from "$lib/supabase.js";

const FALLBACK = [
  "stillness",
  "impossible",
  "hired",
  "warm",
  "again",
  "月",
  "quiet",
  "found",
];

export const guestWords = writable(FALLBACK);
export const guestLoaded = writable(false);
export const guestError = writable(null);

let channel;

export async function initGuestBook() {
  const { data, error } = await supabase
    .from("guest_words")
    .select("word, created_at")
    .order("created_at", { ascending: true })
    .limit(60);

  if (error) {
    console.warn("[GuestBook] fetch error:", error.message);
    guestError.set(error.message);
  } else {
    guestWords.set(data.map((r) => r.word));
    guestLoaded.set(true);
  }

  channel = supabase
    .channel("guest_words_changes")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "guest_words" },
      (payload) => {
        const word = payload.new?.word;
        if (word) {
          guestWords.update((w) => {
            if (w.includes(word)) return w;
            return [...w.slice(-59), word];
          });
        }
      },
    )
    .subscribe();
}

export async function submitWord(word) {
  const clean = word.trim().slice(0, 20);
  if (!clean) return { ok: false, error: "empty" };

  guestWords.update((w) => [...w.slice(-59), clean]);

  const { error } = await supabase.from("guest_words").insert({ word: clean });

  if (error) {
    console.warn("[GuestBook] insert error:", error.message);

    guestWords.update((w) => w.filter((x) => x !== clean));
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export function destroyGuestBook() {
  if (channel) supabase.removeChannel(channel);
}
