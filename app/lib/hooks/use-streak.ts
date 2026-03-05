"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildCalendarDays,
  computeStreaks,
  DEFAULT_CALENDAR_DAYS,
  getActiveDates,
  getUnlockedMilestones,
} from "@/lib/academy/streak";

export type StreakState = {
  currentStreak: number;
  longestStreak: number;
  calendarDays: Array<{ dateKey: string; active: boolean }>;
  unlockedMilestones: number[];
};

function deriveState(wallet: string | undefined): StreakState | null {
  if (!wallet) return null;
  const activeDates = getActiveDates(wallet);
  const { current, longest } = computeStreaks(activeDates);
  return {
    currentStreak: current,
    longestStreak: longest,
    calendarDays: buildCalendarDays(DEFAULT_CALENDAR_DAYS, activeDates),
    unlockedMilestones: getUnlockedMilestones(longest),
  };
}

export function useStreak(wallet: string | undefined): StreakState | null {
  const [state, setState] = useState<StreakState | null>(() =>
    deriveState(wallet)
  );

  const refresh = useCallback(() => {
    setState(deriveState(wallet));
  }, [wallet]);

  useEffect(() => {
    if (!wallet) {
      setState(null);
      return;
    }
    setState(deriveState(wallet));
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ wallet: string }>).detail;
      if (detail?.wallet === wallet) refresh();
    };
    window.addEventListener("academy:streak-updated", onUpdate);
    return () => window.removeEventListener("academy:streak-updated", onUpdate);
  }, [wallet, refresh]);

  return state;
}
