"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useSolanaClient,
  useWallet,
} from "@solana/connector/react";
import { type Address, unwrapOption } from "@solana/kit";
import { fetchMaybeEnrollment } from "@superteam/academy-sdk";
import {
  CalendarBlank,
  Certificate,
  Fire,
  Medal,
  Sparkle,
  Star,
  TrendUp,
} from "@phosphor-icons/react";
import { Link } from "@/i18n/navigation";
import {
  getAchievements,
  getLeaderboard,
  type Achievement,
} from "@/lib/api/academy";
import {
  levelFromXp,
  levelProgressPercent,
  xpToNextLevel,
} from "@/lib/academy/level";
import { getEnrollmentPda } from "@/lib/academy/pdas";
import { getCompletedLessonIndices } from "@/lib/academy/lesson-bitmap";
import { useStreak } from "@/lib/hooks/use-streak";
import { useXpBalance } from "@/lib/hooks/use-xp-balance";
import type { Course } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

type DashboardPageClientProps = {
  activeCourses: Course[];
};

type EnrolledCourseProgress = {
  course: Course;
  completedLessons: number;
  completionPercent: number;
  nextLesson: string | null;
  enrolledAt: bigint;
  completedAt: bigint | null;
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  timestampMs: number;
};

const DASHBOARD_META_REFRESH_INTERVAL_MS = 30_000;

function formatDateTime(valueMs: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(valueMs));
}

function timestampSecondsToMs(value: number | bigint): number {
  return Number(value) * 1000;
}

function normalizeWalletAddress(value: string): string {
  return value.trim();
}

function nextLessonTitle(
  course: Course,
  completedSet: Set<number>
): string | null {
  let flatIndex = 0;
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!completedSet.has(flatIndex)) {
        return lesson.title;
      }
      flatIndex += 1;
    }
  }
  return null;
}

export function DashboardPageClient({
  activeCourses,
}: DashboardPageClientProps) {
  const { isConnected } = useWallet();
  const { address } = useAccount();
  const { client, ready } = useSolanaClient();
  const { xp, loading: xpLoading } = useXpBalance();
  const streakState = useStreak(address ?? undefined);

  const [enrolledCourses, setEnrolledCourses] = useState<
    EnrolledCourseProgress[]
  >([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [rank, setRank] = useState<number | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  const loadDashboardMeta = useCallback(
    async (signal?: AbortSignal) => {
      if (!address) return;
      const normalizedAddress = normalizeWalletAddress(address);

      setLoadingMeta(true);
      try {
        const [leaderboardResult, achievementsResult] = await Promise.allSettled(
          [getLeaderboard(), getAchievements(address)]
        );

        if (signal?.aborted) return;

        if (leaderboardResult.status === "fulfilled") {
          const myEntry = leaderboardResult.value.find(
            (entry) => normalizeWalletAddress(entry.wallet) === normalizedAddress
          );
          setRank(myEntry?.rank ?? null);
        } else {
          console.error("Failed to load leaderboard", leaderboardResult.reason);
          setRank(null);
        }

        if (achievementsResult.status === "fulfilled") {
          setAchievements(
            achievementsResult.value.sort((a, b) => b.awardedAt - a.awardedAt)
          );
        } else {
          console.error(
            "Failed to load achievements",
            achievementsResult.reason
          );
          setAchievements([]);
        }
      } catch (error) {
        if (signal?.aborted) return;
        console.error("Failed to load dashboard metadata", error);
        setRank(null);
        setAchievements([]);
      } finally {
        if (!signal?.aborted) {
          setLoadingMeta(false);
        }
      }
    },
    [address]
  );

  const loadDashboardData = useCallback(
    async (signal?: AbortSignal) => {
      if (!isConnected) {
        setEnrolledCourses([]);
        setRank(null);
        setAchievements([]);
        return;
      }
      if (!address || !ready || !client) return;

      setLoadingEnrollments(true);
      try {
        const enrollmentRows = await Promise.allSettled(
          activeCourses.map(
            async (course): Promise<EnrolledCourseProgress | null> => {
              if (signal?.aborted) return null;
              const enrollmentPda = await getEnrollmentPda(
                course.id,
                address as Address
              );
              const maybeEnrollment = await fetchMaybeEnrollment(
                client.rpc,
                enrollmentPda
              );
              if (!maybeEnrollment.exists) return null;

              const completed = getCompletedLessonIndices(
                maybeEnrollment.data.lessonFlags,
                course.totalLessons
              );
              const completedSet = new Set(completed);
              const completionPercent =
                course.totalLessons > 0
                  ? Math.round((completed.length / course.totalLessons) * 100)
                  : 0;

              return {
                course,
                completedLessons: completed.length,
                completionPercent,
                nextLesson: nextLessonTitle(course, completedSet),
                enrolledAt: maybeEnrollment.data.enrolledAt,
                completedAt: unwrapOption(
                  maybeEnrollment.data.completedAt,
                  () => null
                ),
              };
            }
          )
        );

        if (signal?.aborted) return;

        const onlyEnrolled = enrollmentRows.flatMap((result) =>
          result.status === "fulfilled" && result.value !== null
            ? [result.value]
            : []
        );

        onlyEnrolled.sort((a, b) => Number(b.enrolledAt - a.enrolledAt));
        setEnrolledCourses(onlyEnrolled);
      } catch (error) {
        if (signal?.aborted) return;
        console.error("Failed to load enrollments", error);
        setEnrolledCourses([]);
      } finally {
        if (!signal?.aborted) {
          setLoadingEnrollments(false);
        }
      }

      await loadDashboardMeta(signal);
    },
    [activeCourses, address, client, isConnected, loadDashboardMeta, ready]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadDashboardData(controller.signal);
    return () => controller.abort();
  }, [loadDashboardData]);

  useEffect(() => {
    if (!isConnected || !address || !ready || !client) return;

    const refreshMeta = () => {
      const controller = new AbortController();
      void loadDashboardMeta(controller.signal);
    };

    const onVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        refreshMeta();
      }
    };

    const intervalId = window.setInterval(
      refreshMeta,
      DASHBOARD_META_REFRESH_INTERVAL_MS
    );
    window.addEventListener("focus", onVisibilityOrFocus);
    document.addEventListener("visibilitychange", onVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onVisibilityOrFocus);
      document.removeEventListener("visibilitychange", onVisibilityOrFocus);
    };
  }, [address, client, isConnected, loadDashboardMeta, ready]);

  const level = levelFromXp(xp);
  const levelProgress = levelProgressPercent(xp);
  const xpToNext = xpToNextLevel(xp);

  const recommendedCourses = useMemo(() => {
    const enrolledIds = new Set(enrolledCourses.map((c) => c.course.id));
    return activeCourses
      .filter((course) => !enrolledIds.has(course.id))
      .sort((a, b) => b.xpReward - a.xpReward)
      .slice(0, 3);
  }, [activeCourses, enrolledCourses]);

  const activityFeed = useMemo(() => {
    const enrollmentActivities: ActivityItem[] = enrolledCourses.flatMap(
      (row) => {
        const items: ActivityItem[] = [
          {
            id: `enrolled-${row.course.id}`,
            title: `Enrolled in ${row.course.title}`,
            subtitle: `${row.completedLessons}/${row.course.totalLessons} lessons completed`,
            timestampMs: timestampSecondsToMs(row.enrolledAt),
          },
        ];
        if (row.completedAt !== null) {
          items.push({
            id: `completed-${row.course.id}`,
            title: `Completed ${row.course.title}`,
            subtitle: "Course completed on-chain",
            timestampMs: timestampSecondsToMs(row.completedAt),
          });
        }
        return items;
      }
    );

    const achievementActivities: ActivityItem[] = achievements.map((a) => ({
      id: `achievement-${a.asset}`,
      title: `Achievement unlocked: ${a.name}`,
      subtitle: "Awarded as an on-chain badge",
      timestampMs: timestampSecondsToMs(a.awardedAt),
    }));

    return [...enrollmentActivities, ...achievementActivities]
      .sort((a, b) => b.timestampMs - a.timestampMs)
      .slice(0, 8);
  }, [achievements, enrolledCourses]);

  if (!isConnected || !address) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Connect your wallet to view your on-chain learning progress.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 pb-16 pt-10 sm:px-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          Track your XP, course progress, streak, and recent on-chain activity.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkle size={18} />
              XP and Level
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {xpLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">XP Balance</p>
                    <p className="font-mono text-3xl font-semibold">{xp}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Level
                    </span>
                    <span
                      className="mt-0.5 font-heading text-2xl font-bold tabular-nums text-primary"
                      aria-label={`Level ${level}`}
                    >
                      {level}
                    </span>
                  </div>
                </div>
                <Progress value={levelProgress} />
                <p className="text-xs text-muted-foreground">
                  {xpToNext > 0
                    ? `${xpToNext} XP to reach Level ${level + 1}`
                    : `Level ${level} complete`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Medal size={18} />
              Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMeta ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="font-mono text-3xl font-semibold">
                  {rank !== null ? `#${rank}` : "Unranked"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Based on global leaderboard XP standings.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendUp size={18} />
              Current Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingEnrollments ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : enrolledCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You are not enrolled in any courses yet.
              </p>
            ) : (
              enrolledCourses.map((row) => (
                <div
                  key={row.course.id}
                  className="space-y-2 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium">{row.course.title}</p>
                    <Badge variant="outline">{row.completionPercent}%</Badge>
                  </div>
                  <Progress value={row.completionPercent} />
                  <p className="text-xs text-muted-foreground">
                    Next lesson: {row.nextLesson ?? "Course completed"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Fire size={18} />
              Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Current
                </p>
                <p className="font-mono text-2xl font-semibold tabular-nums">
                  {streakState ? streakState.currentStreak : 0} days
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Longest
                </p>
                <p className="font-mono text-2xl font-semibold tabular-nums">
                  {streakState ? streakState.longestStreak : 0} days
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Complete at least one lesson per day to keep your streak.
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {(streakState?.calendarDays ?? []).map((day) => (
                <div
                  key={day.dateKey}
                  title={day.dateKey}
                  className={
                    day.active
                      ? "h-4 rounded-sm bg-primary/80"
                      : "h-4 rounded-sm bg-muted"
                  }
                />
              ))}
            </div>
            {streakState && streakState.unlockedMilestones.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {streakState.unlockedMilestones.map((m) => (
                  <Badge key={m} variant="secondary" className="tabular-nums">
                    {m} day
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Certificate size={18} />
              Recent Achievements and Badges
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingMeta ? (
              <Skeleton className="h-28 w-full" />
            ) : achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No achievements yet. Complete lessons and courses to unlock
                badges.
              </p>
            ) : (
              achievements.slice(0, 5).map((achievement) => (
                <div
                  key={achievement.asset}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(
                        timestampSecondsToMs(achievement.awardedAt)
                      )}
                    </p>
                  </div>
                  <Badge variant="outline">Badge</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star size={18} />
              Recommended Next Courses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendedCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You are enrolled in all available active courses.
              </p>
            ) : (
              recommendedCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {course.totalLessons} lessons • {course.xpReward} XP
                    </p>
                  </div>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarBlank size={18} />
              Recent Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            ) : (
              activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border p-3"
                >
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(item.timestampMs)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
