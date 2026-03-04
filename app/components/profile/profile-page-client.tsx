"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowSquareOut,
  GlobeHemisphereWest,
  GithubLogo,
  LinkSimpleHorizontal,
  SealCheck,
  Sparkle,
  Trophy,
  UserCircle,
  XCircle,
} from "@phosphor-icons/react";
import {
  useAccount,
  useTransactionSigner,
  useWallet,
} from "@solana/connector/react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  getAchievements,
  getCompletedCourses,
  getCredentials,
  getProfileByUsername,
  getProfileByWallet,
  getProfileMe,
  type Achievement,
  type CompletedEnrollment,
  type Credential,
  type Profile,
} from "@/lib/api/academy";
import { saveProfileWithWalletAuth } from "@/lib/academy/profile";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

type SocialLinks = {
  twitter?: string;
  github?: string;
  website?: string;
};

const TRACK_LABELS: Record<number, string> = {
  1: "Solana Fundamentals",
  2: "Anchor Development",
  3: "DeFi on Solana",
};

const radarSkills = [
  "Rust",
  "Anchor",
  "Frontend",
  "Security",
  "DeFi",
  "Testing",
];

function shortWallet(value: string): string {
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function parseSocialLinks(raw: string | null): SocialLinks {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as SocialLinks;
    return {
      twitter: typeof parsed.twitter === "string" ? parsed.twitter : undefined,
      github: typeof parsed.github === "string" ? parsed.github : undefined,
      website: typeof parsed.website === "string" ? parsed.website : undefined,
    };
  } catch {
    return {};
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function validateOptionalUrl(value: string, field: string): string | null {
  if (!value.trim()) return null;
  const normalized = normalizeUrl(value);
  try {
    new URL(normalized);
    return null;
  } catch {
    return `${field} must be a valid URL`;
  }
}

function extractUsername(input: string): string {
  const value = input.trim();
  if (value.startsWith("@")) return value.slice(1);
  return value;
}

function usernameIsValid(value: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(value);
}

function getTrackLabel(trackId: number): string {
  return TRACK_LABELS[trackId] ?? `Track #${trackId}`;
}

function assetExplorerUrl(asset: string): string {
  const cluster = env.NEXT_PUBLIC_SOLANA_NETWORK;
  if (cluster === "mainnet" || cluster === "mainnet-beta") {
    return `https://explorer.solana.com/address/${asset}`;
  }
  return `https://explorer.solana.com/address/${asset}?cluster=${cluster}`;
}

function socialIconFor(key: keyof SocialLinks) {
  if (key === "github") return GithubLogo;
  if (key === "website") return LinkSimpleHorizontal;
  return GlobeHemisphereWest;
}

function buildSkillScores(input: {
  completed: CompletedEnrollment[];
  achievements: Achievement[];
  credentials: Credential[];
  bio: string;
  socialCount: number;
}): number[] {
  const scores = [18, 18, 18, 18, 18, 18];

  for (const enrollment of input.completed) {
    const id = enrollment.courseId.toLowerCase();
    if (id.includes("rust") || id.includes("anchor")) scores[0] += 16;
    if (id.includes("anchor")) scores[1] += 15;
    if (id.includes("frontend") || id.includes("ui")) scores[2] += 17;
    if (id.includes("security") || id.includes("audit")) scores[3] += 17;
    if (id.includes("defi") || id.includes("dex") || id.includes("lending")) {
      scores[4] += 18;
    }
    if (id.includes("test") || id.includes("challenge")) scores[5] += 15;
  }

  for (const credential of input.credentials) {
    const index = credential.trackId % radarSkills.length;
    scores[index] += 12 + credential.trackLevel * 3;
  }

  scores[3] += Math.min(input.achievements.length * 5, 20);
  scores[2] += Math.min(input.socialCount * 4, 12);
  scores[5] += Math.min(input.completed.length * 3, 20);
  if (input.bio.length > 80) scores[0] += 6;

  return scores.map((value) => Math.max(10, Math.min(100, value)));
}

function RadarChart({ scores }: { scores: number[] }) {
  const size = 260;
  const center = size / 2;
  const radius = 90;
  const axisCount = radarSkills.length;

  const points = scores.map((score, index) => {
    const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
    const scaled = (score / 100) * radius;
    return `${center + Math.cos(angle) * scaled},${center + Math.sin(angle) * scaled}`;
  });

  return (
    <div className="mx-auto w-full max-w-[18rem]">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full"
        role="img"
        aria-label="Skill radar chart"
      >
        {[0.25, 0.5, 0.75, 1].map((step) => {
          const ringPoints = radarSkills.map((_, index) => {
            const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
            const r = radius * step;
            return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
          });
          return (
            <polygon
              key={step}
              points={ringPoints.join(" ")}
              className="fill-transparent stroke-border"
              strokeWidth="1"
            />
          );
        })}

        {radarSkills.map((skill, index) => {
          const angle = (Math.PI * 2 * index) / axisCount - Math.PI / 2;
          const x = center + Math.cos(angle) * radius;
          const y = center + Math.sin(angle) * radius;
          return (
            <line
              key={skill}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              className="stroke-border"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={points.join(" ")}
          className="fill-primary/24 stroke-primary"
          strokeWidth="2"
        />
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        {radarSkills.map((skill, index) => (
          <div
            key={skill}
            className="flex items-center justify-between rounded-md border border-border/80 bg-background/60 px-2 py-1.5"
          >
            <span>{skill}</span>
            <span className="font-semibold text-foreground">
              {scores[index]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfilePageClient({
  publicIdentity,
}: {
  publicIdentity: string | null;
}) {
  const { isConnected } = useWallet();
  const { address } = useAccount();
  const { signer } = useTransactionSigner();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [completed, setCompleted] = useState<CompletedEnrollment[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [twitter, setTwitter] = useState("");
  const [github, setGithub] = useState("");
  const [website, setWebsite] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const isPublicView = publicIdentity !== null;
  const canEdit = !isPublicView && isConnected && !!address;

  const hydrateForm = useCallback((next: Profile | null) => {
    if (!next) return;
    const social = parseSocialLinks(next.socialLinks);
    setUsername(next.username ?? "");
    setDisplayName(next.displayName ?? "");
    setBio(next.bio ?? "");
    setAvatarUrl(next.avatarUrl ?? "");
    setTwitter(social.twitter ?? "");
    setGithub(social.github ?? "");
    setWebsite(social.website ?? "");
    setIsPublic(next.visibility !== "private");
  }, []);

  const loadProfilePage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isPublicView) {
        const identity = publicIdentity!.trim();
        const fetched =
          identity.length >= 32
            ? await getProfileByWallet(identity)
            : await getProfileByUsername(identity);

        if (!fetched) {
          setProfile(null);
          setCompleted([]);
          setCredentials([]);
          setAchievements([]);
          return;
        }

        setProfile(fetched);
        hydrateForm(fetched);
        const [completedRows, credentialRows, achievementRows] =
          await Promise.all([
            getCompletedCourses(fetched.wallet),
            getCredentials(fetched.wallet),
            getAchievements(fetched.wallet),
          ]);
        setCompleted(completedRows);
        setCredentials(credentialRows);
        setAchievements(achievementRows);
        return;
      }

      if (!address) {
        setProfile(null);
        setCompleted([]);
        setCredentials([]);
        setAchievements([]);
        return;
      }

      const fetched = await getProfileMe(address);
      setProfile(fetched);
      if (!fetched) {
        setCompleted([]);
        setCredentials([]);
        setAchievements([]);
        return;
      }

      hydrateForm(fetched);
      const [completedRows, credentialRows, achievementRows] =
        await Promise.all([
          getCompletedCourses(fetched.wallet),
          getCredentials(fetched.wallet),
          getAchievements(fetched.wallet),
        ]);
      setCompleted(completedRows);
      setCredentials(credentialRows);
      setAchievements(achievementRows);
    } catch (loadError) {
      console.error(loadError);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }, [address, hydrateForm, isPublicView, publicIdentity]);

  useEffect(() => {
    void loadProfilePage();
  }, [loadProfilePage]);

  const previewSocials = useMemo(
    () => ({
      twitter: normalizeUrl(twitter) || undefined,
      github: normalizeUrl(github) || undefined,
      website: normalizeUrl(website) || undefined,
    }),
    [github, twitter, website],
  );

  const activeProfile = useMemo(() => {
    if (profile) return profile;
    const wallet = address ?? "";
    return {
      wallet,
      username: extractUsername(username) || "new_builder",
      displayName: displayName.trim() || null,
      bio: bio.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      socialLinks:
        previewSocials.twitter ||
        previewSocials.github ||
        previewSocials.website
          ? JSON.stringify(previewSocials)
          : null,
      joinDate: new Date().toISOString(),
      visibility: isPublic ? "public" : "private",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } satisfies Profile;
  }, [
    address,
    avatarUrl,
    bio,
    displayName,
    isPublic,
    previewSocials,
    profile,
    username,
  ]);

  const activeSocials = parseSocialLinks(activeProfile.socialLinks);
  const displayTitle =
    activeProfile.displayName?.trim() || activeProfile.username || "Builder";

  const scores = useMemo(() => {
    const socialCount = (
      Object.keys(activeSocials) as (keyof SocialLinks)[]
    ).filter((key) => !!activeSocials[key]).length;
    return buildSkillScores({
      completed,
      achievements,
      credentials,
      bio: activeProfile.bio ?? "",
      socialCount,
    });
  }, [activeProfile.bio, achievements, activeSocials, completed, credentials]);

  const saveProfile = useCallback(async () => {
    if (!address) {
      toast.error("Connect wallet before creating a profile.");
      return;
    }
    if (!signer?.signMessage) {
      toast.error("Connected wallet does not support message signing.");
      return;
    }

    const nextUsername = extractUsername(username);
    if (!nextUsername) {
      toast.error("Username is required.");
      return;
    }
    if (!usernameIsValid(nextUsername)) {
      toast.error(
        "Username can only contain letters, numbers, hyphen, and underscore.",
      );
      return;
    }

    for (const [value, label] of [
      [avatarUrl, "Avatar URL"],
      [twitter, "Twitter URL"],
      [github, "GitHub URL"],
      [website, "Website URL"],
    ] as const) {
      const validationError = validateOptionalUrl(value, label);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    setSaving(true);
    try {
      const result = await saveProfileWithWalletAuth({
        wallet: address,
        signer,
        username: nextUsername,
        displayName,
        bio,
        avatarUrl: normalizeUrl(avatarUrl),
        socialLinks: previewSocials,
        visibility: isPublic ? "public" : "private",
      });

      if (!result.ok) {
        if (result.error === "USERNAME_TAKEN") {
          toast.error("That username is already taken.");
        } else if (result.error === "SIGNATURE_REJECTED") {
          toast.error("Signature request was canceled.");
        } else {
          toast.error(`Failed to save profile (${result.error}).`);
        }
        return;
      }

      setProfile(result.profile);
      hydrateForm(result.profile);
      toast.success("Profile saved.");
      await loadProfilePage();
    } catch (saveError) {
      console.error(saveError);
      toast.error("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }, [
    address,
    avatarUrl,
    bio,
    displayName,
    github,
    hydrateForm,
    isPublic,
    loadProfilePage,
    previewSocials,
    signer,
    twitter,
    username,
    website,
  ]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
      <section className="relative overflow-hidden rounded-2xl border border-border/80 bg-card px-5 py-6 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,color-mix(in_srgb,var(--primary)_22%,transparent),transparent_48%),radial-gradient(circle_at_88%_88%,color-mix(in_srgb,var(--secondary)_26%,transparent),transparent_45%)]" />
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkle className="size-3.5" weight="fill" />
              Builder Identity
            </p>
            <h1 className="mt-2 font-heading text-3xl font-black tracking-tight sm:text-4xl">
              Profile & On-Chain Reputation
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Your public builder card with skills, achievements, credentials,
              and course proof.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{credentials.length} Credentials</Badge>
            <Badge variant="outline">{achievements.length} Achievements</Badge>
            <Badge variant="outline">
              {completed.length} Courses Completed
            </Badge>
          </div>
        </div>
      </section>

      {error ? (
        <Card className="mt-5 border-destructive/40">
          <CardContent className="flex items-center gap-2 py-4 text-destructive">
            <XCircle className="size-5" />
            {error}
          </CardContent>
        </Card>
      ) : null}

      {!canEdit && !isPublicView ? (
        <Card className="mt-5 border-dashed">
          <CardContent className="flex items-center gap-2 py-5 text-muted-foreground">
            <UserCircle className="size-5" />
            Connect your wallet to create or edit your profile.
          </CardContent>
        </Card>
      ) : null}

      {isPublicView && !profile ? (
        <Card className="mt-5 border-dashed">
          <CardContent className="py-5 text-muted-foreground">
            Public profile not found, or this profile is private.
          </CardContent>
        </Card>
      ) : null}

      <section className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card className="overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
          <CardContent className="py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar data-size="lg" className="size-20 ring-2 ring-border">
                {activeProfile.avatarUrl ? (
                  <AvatarImage
                    src={activeProfile.avatarUrl}
                    alt={displayTitle}
                  />
                ) : null}
                <AvatarFallback className="text-lg font-semibold">
                  {displayTitle.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-heading text-2xl font-bold">
                    {displayTitle}
                  </h2>
                  <Badge variant="outline">@{activeProfile.username}</Badge>
                  {activeProfile.visibility === "public" ? (
                    <Badge variant="secondary">Public</Badge>
                  ) : (
                    <Badge variant="destructive">Private</Badge>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {activeProfile.bio?.trim() ||
                    "Add a bio to tell people what you build."}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Joined {formatDate(activeProfile.joinDate)}
                  {activeProfile.wallet
                    ? ` • Wallet ${shortWallet(activeProfile.wallet)}`
                    : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(Object.keys(activeSocials) as (keyof SocialLinks)[])
                    .filter((key) => !!activeSocials[key])
                    .map((key) => {
                      const Icon = socialIconFor(key);
                      return (
                        <a
                          key={key}
                          href={activeSocials[key]}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/70 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Icon className="size-3.5" />
                          {key}
                        </a>
                      );
                    })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Skill Radar</CardTitle>
            <CardDescription>
              Skill signal from completed tracks and credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadarChart scores={scores} />
          </CardContent>
        </Card>
      </section>

      {canEdit ? (
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>{profile ? "Edit Profile" : "Create Profile"}</CardTitle>
            <CardDescription>
              One wallet signature updates your profile settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium">
                Username *
              </label>
              <Input
                id="username"
                placeholder="builder_name"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={64}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="displayName"
                placeholder="Your display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={128}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <Textarea
                id="bio"
                placeholder="Share your builder story..."
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={500}
                className="min-h-24"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="avatarUrl" className="text-sm font-medium">
                Avatar URL
              </label>
              <Input
                id="avatarUrl"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="twitter" className="text-sm font-medium">
                Twitter
              </label>
              <Input
                id="twitter"
                placeholder="https://x.com/..."
                value={twitter}
                onChange={(event) => setTwitter(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="github" className="text-sm font-medium">
                GitHub
              </label>
              <Input
                id="github"
                placeholder="https://github.com/..."
                value={github}
                onChange={(event) => setGithub(event.target.value)}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label htmlFor="website" className="text-sm font-medium">
                Website
              </label>
              <Input
                id="website"
                placeholder="https://..."
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="justify-between gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <span className="text-sm">
                Visibility:{" "}
                <span className="font-semibold">
                  {isPublic ? "Public" : "Private"}
                </span>
              </span>
            </div>
            <Button onClick={() => void saveProfile()} disabled={saving}>
              {saving
                ? "Saving..."
                : profile
                  ? "Save Changes"
                  : "Create Profile"}
            </Button>
          </CardFooter>
        </Card>
      ) : null}

      <section className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Trophy className="size-4 text-primary" />
              Achievement Badges
            </CardTitle>
            <CardDescription>
              Verified badges earned by this builder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No achievements yet.
              </p>
            ) : (
              achievements.map((achievement) => (
                <article
                  key={`${achievement.asset}-${achievement.achievementId}`}
                  className="rounded-lg border border-border/80 bg-background/60 p-3"
                >
                  <p className="text-sm font-medium">{achievement.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Awarded{" "}
                    {formatDate(
                      new Date(achievement.awardedAt * 1000).toISOString(),
                    )}
                  </p>
                </article>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <SealCheck className="size-4 text-primary" />
              On-Chain Credentials (cNFTs)
            </CardTitle>
            <CardDescription>
              Evolving credentials with track, level, and verification links.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {credentials.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No credential cNFTs minted yet.
              </p>
            ) : (
              credentials.map((credential) => (
                <article
                  key={credential.asset}
                  className="rounded-lg border border-border/80 bg-background/60 p-3"
                >
                  <p className="text-sm font-medium">
                    {getTrackLabel(credential.trackId)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Level {credential.trackLevel}
                  </p>
                  <a
                    href={credential.verificationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Verify credential <ArrowSquareOut className="size-3" />
                  </a>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="mt-5">
        <CardHeader>
          <CardTitle className="text-sm">Completed Courses</CardTitle>
          <CardDescription>
            Course completions with track level and credential asset links.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {completed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed courses yet.
            </p>
          ) : (
            completed.map((course) => (
              <article
                key={`${course.id}-${course.courseId}`}
                className={cn(
                  "rounded-lg border border-border/80 bg-background/60 p-3",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {course.courseId}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getTrackLabel(course.trackId)} • Level{" "}
                      {course.trackLevel}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {formatDate(course.completedAt)}
                  </Badge>
                </div>
                {course.credentialAsset ? (
                  <a
                    href={assetExplorerUrl(course.credentialAsset)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View credential asset <ArrowSquareOut className="size-3" />
                  </a>
                ) : null}
              </article>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  );
}
