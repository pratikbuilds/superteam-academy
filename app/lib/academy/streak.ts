/**
 * Frontend-only streak: activity = at least one lesson completed that day.
 * Stored in localStorage per wallet; current/longest streak derived from active dates.
 */

const STORAGE_PREFIX = "academy:streak:";
const CALENDAR_DAYS = 35;
const MILESTONES = [7, 14, 30, 60, 100] as const;

export const STREAK_MILESTONES = [...MILESTONES];

export function getStreakStorageKey(wallet: string): string {
  return `${STORAGE_PREFIX}${wallet}`;
}

export function getTodayDateKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseStored(wallet: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStreakStorageKey(wallet));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function writeStored(wallet: string, dates: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const key = getStreakStorageKey(wallet);
    const unique = [...new Set(dates)].sort();
    localStorage.setItem(key, JSON.stringify(unique));
    window.dispatchEvent(
      new CustomEvent("academy:streak-updated", { detail: { wallet } })
    );
  } catch {
    // ignore
  }
}

export function getActiveDates(wallet: string): string[] {
  return parseStored(wallet);
}

export function recordActivity(wallet: string): void {
  const dates = parseStored(wallet);
  const today = getTodayDateKey();
  if (dates.includes(today)) return;
  writeStored(wallet, [...dates, today]);
}

function dateToMs(dateKey: string): number {
  return new Date(dateKey + "T12:00:00").getTime();
}

export function computeStreaks(activeDates: string[]): {
  current: number;
  longest: number;
} {
  if (activeDates.length === 0) return { current: 0, longest: 0 };
  const sorted = [...new Set(activeDates)].sort();
  const today = getTodayDateKey();
  const hasToday = sorted.includes(today);

  let current = 0;
  const runEndingToday = sorted.filter((d) => dateToMs(d) <= dateToMs(today));
  for (let i = runEndingToday.length - 1; i >= 0; i--) {
    const prev = i === 0 ? null : dateToMs(runEndingToday[i - 1]);
    const curr = dateToMs(runEndingToday[i]);
    const dayDiff = prev === null ? 1 : (curr - prev) / (24 * 60 * 60 * 1000);
    if (dayDiff > 1) break;
    current += 1;
  }
  if (current > 0 && !hasToday) current = 0;

  let longest = sorted.length >= 1 ? 1 : 0;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = dateToMs(sorted[i - 1]);
    const curr = dateToMs(sorted[i]);
    const dayDiff = (curr - prev) / (24 * 60 * 60 * 1000);
    if (dayDiff === 1) {
      run += 1;
    } else {
      longest = Math.max(longest, run);
      run = 1;
    }
  }
  longest = Math.max(longest, run);

  return { current, longest };
}

export function buildCalendarDays(
  daysBack: number,
  activeDates: string[]
): Array<{ dateKey: string; active: boolean }> {
  const set = new Set(activeDates);
  const today = new Date();
  return Array.from({ length: daysBack }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (daysBack - 1 - i));
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    return { dateKey, active: set.has(dateKey) };
  });
}

export function getUnlockedMilestones(longestStreak: number): number[] {
  return MILESTONES.filter((m) => longestStreak >= m);
}

export const DEFAULT_CALENDAR_DAYS = CALENDAR_DAYS;
