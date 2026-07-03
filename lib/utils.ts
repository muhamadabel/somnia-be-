export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Normalize a date to local noon so date-only values are DST/timezone safe. */
export function toDreamDate(input: string | Date): Date {
  const d = typeof input === "string" ? new Date(input + "T12:00:00") : new Date(input);
  d.setHours(12, 0, 0, 0);
  return d;
}

export function formatDate(date: Date | string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  });
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "baru saja";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mnt lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hr lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bln lalu`;
  return `${Math.floor(months / 12)} thn lalu`;
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export function parseJsonArray(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function safeParseJson<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/** Deterministic pseudo-random generator (mulberry32) for reproducible art. */
export function seededRandom(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
