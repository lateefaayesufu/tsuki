import { writable, derived, get } from "svelte/store";

const weathers = ["still", "rain", "wind"];
const storedWeather =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("tsukiyo_weather") ||
      weathers[Math.floor(Math.random() * 3)]
    : "rain";
if (typeof localStorage !== "undefined") {
  localStorage.setItem("tsukiyo_weather", storedWeather);
}

const storedLabel =
  typeof localStorage !== "undefined"
    ? localStorage.getItem("tsukiyo_visitLabel")
    : null;

export const phase = writable("entry");
export const room = writable(0);
export const weather = writable(storedWeather);
export const visitLabel = writable(storedLabel);
export const musicPlaying = writable(false);
export const menuOpen = writable(false);
export const guestBookOpen = writable(false);
export const haikuFound = writable([false, false, false]);
export const idleSeconds = writable(0);
export const cursorStyle = writable("default");
export const windStrength = writable(0);
export const scrollVel = writable(0);
export const mx = writable(0);
export const my = writable(0);

const _mq =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
export const reducedMotion = writable(_mq?.matches ?? false);
_mq?.addEventListener("change", (e) => reducedMotion.set(e.matches));

export const MOON_PHASES = [0, 0.25, 0.5, 0.75, 1, 0.75];
export const MOON_LABELS = [
  "新月 · NEW MOON",
  "上弦 · WAXING",
  "半月 · HALF",
  "十三夜 · GIBBOUS",
  "満月 · FULL MOON",
  "下弦 · WANING",
];
export const ROOM_NAMES = ["jo", "zensai", "tsukuri", "yakimono", "mizugashi"];
export const ROOM_CURSORS = {
  jo: "default",
  zensai: "pen",
  tsukuri: "pin",
  yakimono: "magnify",
  mizugashi: "pen",
};

export const moonPhase = derived(room, ($r) => MOON_PHASES[$r] ?? 0);
export const crescentPhase = derived(room, ($r) => MOON_PHASES[$r] ?? 0);
export const moonLabel = derived(
  room,
  ($r) => MOON_LABELS[$r] ?? MOON_LABELS[0],
);
export const roomName = derived(room, ($r) => ROOM_NAMES[$r]);
export const isInside = derived(phase, ($p) => $p === "inside");

const defaultWords = [
  "stillness",
  "impossible",
  "hired",
  "warm",
  "again",
  "月",
  "quiet",
  "found",
];
const storedWords =
  typeof localStorage !== "undefined"
    ? JSON.parse(
        localStorage.getItem("tsukiyo_guestWords") ||
          JSON.stringify(defaultWords),
      )
    : defaultWords;
export const guestWords = writable(storedWords);
guestWords.subscribe((w) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("tsukiyo_guestWords", JSON.stringify(w.slice(-50)));
  }
});

export function goToRoom(idx, animate = true) {
  const rooms = get(room);
  if (idx < 0 || idx >= ROOM_NAMES.length) return false;
  room.set(idx);
  cursorStyle.set(ROOM_CURSORS[ROOM_NAMES[idx]] || "default");
  return true;
}

export function addGuestWord(word) {
  guestWords.update((w) => [...w, word]);
}

export function markHaikuFound(idx) {
  haikuFound.update((h) => {
    const next = [...h];
    next[idx] = true;
    return next;
  });
}

export function setVisitLabel(label) {
  visitLabel.set(label);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("tsukiyo_visitLabel", label);
  }
}
