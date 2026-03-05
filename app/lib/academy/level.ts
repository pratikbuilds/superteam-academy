/**
 * Level = floor(sqrt(totalXP / 100)).
 * XP rewards: lesson 10–50, challenge 25–100, course 500–2000, daily streak 10, first completion of day 25.
 */

export function levelFromXp(totalXp: number): number {
  if (totalXp <= 0) return 0;
  return Math.floor(Math.sqrt(totalXp / 100));
}

/** XP required at the start of current level (100 * level²). */
export function xpFloorForLevel(level: number): number {
  return 100 * level * level;
}

/** XP required to reach next level (100 * (level+1)²). */
export function xpCeilingForLevel(level: number): number {
  return 100 * (level + 1) * (level + 1);
}

/** XP remaining until next level. */
export function xpToNextLevel(totalXp: number): number {
  const level = levelFromXp(totalXp);
  const ceiling = xpCeilingForLevel(level);
  return Math.max(ceiling - totalXp, 0);
}

/** Progress within current level, 0–100. */
export function levelProgressPercent(totalXp: number): number {
  if (totalXp <= 0) return 0;
  const level = levelFromXp(totalXp);
  const floor = xpFloorForLevel(level);
  const ceiling = xpCeilingForLevel(level);
  const range = ceiling - floor;
  if (range <= 0) return 100;
  return Math.min(((totalXp - floor) / range) * 100, 100);
}
