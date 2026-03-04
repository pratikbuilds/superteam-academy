import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import {
  Anchor,
  ArrowRight,
  Certificate,
  Coins,
  Cube,
  CurrencyDollar,
  Lightning,
  ShieldCheck,
  TerminalWindow,
} from "@phosphor-icons/react/dist/ssr";
import { SuperteamFooter } from "@/components/superteam-footer";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getAllTracks } from "@/lib/data/queries";

const trackIconMap: Record<string, ComponentType<IconProps>> = {
  Cube,
  Anchor,
  CurrencyDollar,
};

const signalLedger = [
  "Anchor production patterns",
  "Rust-first curriculum",
  "Wallet-native credentials",
  "Token-2022 soulbound XP",
];

const runtimeTiles = [
  { label: "Rust suites", value: "27 active" },
  { label: "Anchor checks", value: "93 pass" },
  { label: "XP mints", value: "1.7M total" },
  { label: "Credential NFTs", value: "12.4k live" },
];

const proofRail = [
  {
    step: "Compile lesson in browser runtime",
    status: "Runtime check",
    meta: "~90 sec",
  },
  {
    step: "Pass challenge suite and signer guard",
    status: "Evaluation",
    meta: "~4.5 hrs",
  },
  {
    step: "Mint non-transferable XP record",
    status: "Reward mint",
    meta: "Auto",
  },
  {
    step: "Issue wallet-native credential NFT",
    status: "Final proof",
    meta: "Graduation",
  },
];

const heroPillars = [
  {
    label: "Runtime",
    title: "In-browser IDE",
    detail: "Write and run Rust lessons directly in-context.",
    icon: TerminalWindow,
  },
  {
    label: "Proof",
    title: "Soulbound XP",
    detail: "Every challenge clears into a non-transferable on-chain signal.",
    icon: Coins,
  },
  {
    label: "Outcome",
    title: "Credential NFT",
    detail: "Wallet-native graduation proof respected by real teams.",
    icon: Certificate,
  },
];

const runtimeEvents = [
  "complete_lesson(lesson_id: 12)",
  "mint_xp(amount: 100)",
  "course_progress(track: 'anchor', step: 'suite_04')",
  "credential eligibility: 9 / 10",
];

const proofPoints = [
  {
    value: "12.4k+",
    label: "Active builders",
    detail: "Learners shipping Rust and Anchor lessons this month.",
  },
  {
    value: "98.1%",
    label: "Verified completion",
    detail: "Track milestones tied to signed wallet activity.",
  },
  {
    value: "1.7M",
    label: "Soulbound XP minted",
    detail: "Non-transferable learning signal held by builders.",
  },
  {
    value: "74%",
    label: "Challenge pass rate",
    detail: "Strong quality bar with practical execution tests.",
  },
];

const flowSteps = [
  {
    icon: ShieldCheck,
    title: "Trustless enrollment",
    detail:
      "Wallet signs once, then learner state and permissions are enforced via PDAs.",
  },
  {
    icon: TerminalWindow,
    title: "Challenge-driven learning",
    detail:
      "Every module combines explanation with executable Rust and Anchor tests.",
  },
  {
    icon: Coins,
    title: "On-chain reputation",
    detail:
      "XP proves progression and credentials prove capability in your own wallet.",
  },
  {
    icon: Certificate,
    title: "Credential issuance",
    detail:
      "Graduate tracks and receive wallet-native verifiable certificates.",
  },
];

const verificationSnippet = [
  "pub fn complete_lesson(",
  "  ctx: Context<CompleteLesson>,",
  "  lesson_id: u32,",
  ") -> Result<()> {",
  "  require_keys_eq!(",
  "    ctx.accounts.learner.key(),",
  "    ctx.accounts.enrollment.learner",
  "  );",
  "",
  "  ctx.accounts.enrollment.set_lesson_completed(lesson_id);",
  "  mint_xp(",
  "    &ctx.accounts.xp_mint,",
  "    &ctx.accounts.learner_ata,",
  "    100",
  "  )?;",
  "",
  "  Ok(())",
  "}",
];

export default function Page() {
  const tracks = getAllTracks();
  const totalCourses = tracks.reduce(
    (sum, track) => sum + track.courseCount,
    0,
  );

  return (
    <main className="relative min-h-[calc(100dvh-64px)] overflow-x-clip bg-background text-foreground selection:bg-primary/20">
      <section className="relative overflow-hidden border-b border-border/70 bg-background text-foreground">
        <div className="stbr-shape stbr-shape-panel-left" />
        <div className="stbr-shape stbr-shape-band-top" />
        <div className="stbr-shape stbr-shape-orb-bottom-left" />
        <div className="stbr-shape stbr-shape-orb-bottom-right" />
        <div className="stbr-pattern-dashed pointer-events-none absolute inset-0" />
        <div className="stbr-pattern-cross pointer-events-none absolute inset-0" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 xl:grid-cols-12 xl:gap-10">
            <div className="animate-in slide-in-from-bottom-5 fade-in-0 duration-700 xl:col-span-6 xl:pr-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/45 bg-background/65 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_26%,transparent)] backdrop-blur">
                <span className="inline-block size-1.5 rounded-full bg-primary" />
                Solana Learning Engine
              </span>

              <h1 className="mt-4 max-w-3xl text-4xl leading-[0.98] font-black tracking-tight sm:text-5xl lg:text-[4.5rem]">
                <span className="font-heading">Learn like a builder.</span>
                <span className="mt-2 block bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text font-heading text-transparent">
                  Prove it on-chain.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-[1.12rem]">
                Superteam Academy is built for serious Solana developers. Write
                Rust in the browser, clear challenge suites, and leave with
                proof that compounding teams actually trust.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
                  <span className="academy-status-dot inline-block size-1.5 rounded-full bg-primary" />
                  12.4k active builders
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <span className="inline-block size-1.5 rounded-full bg-secondary" />
                  1.7m soulbound xp minted
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  asChild
                  className="min-w-[13rem] shadow-[0_10px_28px_-16px_rgba(0,140,76,0.95)]"
                >
                  <Link href="/courses">
                    Enter the curriculum
                    <ArrowRight className="ml-1.5 size-4" weight="bold" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="min-w-[11rem] border-border/80 bg-card/60"
                >
                  <Link href="/leaderboard">See top builders</Link>
                </Button>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-border/70 bg-card/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]">
                <div className="academy-signal-marquee flex w-max items-center py-2.5">
                  {[0, 1].map((loop) => (
                    <ul
                      key={loop}
                      className="flex shrink-0 items-center gap-7 px-4"
                    >
                      {signalLedger.map((item) => (
                        <li
                          key={`${loop}-${item}`}
                          className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                        >
                          <Lightning
                            className="size-3 text-primary"
                            weight="fill"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {heroPillars.map((pillar, index) => {
                  const PillarIcon = pillar.icon;
                  return (
                    <article
                      key={pillar.label}
                      className="group rounded-2xl border border-border/75 bg-card/85 p-4 shadow-[0_12px_34px_-28px_rgba(27,35,29,0.9)] transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                          {pillar.label}
                        </p>
                        <span className="inline-flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                          <PillarIcon className="size-4" weight="duotone" />
                        </span>
                      </div>
                      <p className="mt-2 text-xl font-black tracking-tight">
                        {pillar.title}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {pillar.detail}
                      </p>
                      <div
                        className="mt-3 h-1.5 rounded-full bg-muted"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500 group-hover:w-full"
                          style={{ width: `${68 + index * 12}%` }}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="animate-in slide-in-from-bottom-8 fade-in-0 duration-1000 xl:col-span-6 xl:pt-0.5">
              <div className="academy-scan-card relative overflow-hidden rounded-[2rem] border border-border/75 bg-card/92 p-5 shadow-[0_30px_80px_-52px_rgba(27,35,29,0.92)] backdrop-blur sm:p-6">
                <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_86%_10%,color-mix(in_srgb,var(--primary)_34%,transparent)_0%,transparent_48%)]" />
                <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(-36deg,transparent_0_10px,color-mix(in_srgb,var(--secondary)_24%,transparent)_10px_11px)]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/8 to-transparent" />

                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                    <span className="academy-status-dot inline-block size-1.5 rounded-full bg-primary" />
                    Academy runtime map
                  </span>

                  <p className="mt-3 font-heading text-sm font-bold tracking-wide uppercase">
                    From lesson code to wallet proof
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The exact context your builders care about: compile, test,
                    mint signal, and issue credentials.
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    {runtimeTiles.map((tile, index) => (
                      <article
                        key={tile.label}
                        className="rounded-xl border border-border/70 bg-background/82 px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                      >
                        <p className="text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                          {tile.label}
                        </p>
                        <p className="mt-1 text-lg leading-none font-black tracking-tight">
                          {tile.value}
                        </p>
                        <div className="mt-2 h-1 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${62 + index * 10}%` }}
                          />
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Proof rail
                    </p>
                    <ol className="mt-3 space-y-3">
                      {proofRail.map((item, index) => (
                        <li
                          key={item.step}
                          className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/75 px-2.5 py-2.5 shadow-[0_10px_24px_-24px_rgba(27,35,29,0.95)]"
                        >
                          <span className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/18 text-[10px] font-semibold text-primary">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium leading-tight">
                              {item.step}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>{item.status}</span>
                              <span className="rounded-full border border-primary/25 bg-primary/8 px-1.5 py-0.5 text-[10px] text-primary">
                                {item.meta}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="mt-4 rounded-2xl border border-editor-border bg-editor-bg px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <p className="font-mono text-[10px] tracking-wide text-slate-300 uppercase">
                      academy-runtime.log
                    </p>
                    <ul className="mt-2 space-y-1.5 font-mono text-xs text-slate-100">
                      {runtimeEvents.map((event) => (
                        <li key={event} className="flex items-center gap-2">
                          <span className="inline-block size-1.5 rounded-full bg-emerald-400" />
                          <span>{event}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="verification-flow"
        className="relative border-b border-border/70 bg-muted/20"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background/60 to-transparent" />
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {proofPoints.map((point, index) => (
              <article
                key={point.label}
                className="rounded-2xl border border-border/70 bg-card/82 p-4 shadow-[0_16px_34px_-30px_rgba(27,35,29,0.9)] transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_38px_-28px_rgba(27,35,29,0.95)] dark:bg-card/65"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="mb-2 h-1.5 w-12 rounded-full bg-primary/55" />
                <p className="text-2xl font-black tracking-tight">
                  {point.value}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {point.label}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {point.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-b border-border/70">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 xl:grid-cols-12 xl:gap-12">
            <div className="xl:col-span-4 xl:pr-2">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Tracks That Compound
              </p>
              <h2 className="mt-3 max-w-sm font-heading text-3xl font-black tracking-tight md:text-4xl">
                Structured paths, zero fluff.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                Each track is designed like a shipping system: fundamentals,
                advanced patterns, and production-level challenge work.
              </p>
              <div className="mt-5 rounded-2xl border border-border/70 bg-card/75 px-4 py-3 shadow-[0_14px_32px_-26px_rgba(27,35,29,0.92)]">
                <p className="text-xs text-muted-foreground">Total courses</p>
                <p className="text-2xl font-black">{totalCourses}</p>
              </div>
              <Button
                className="mt-6 w-full max-w-[14rem]"
                variant="outline"
                asChild
              >
                <Link href="/courses">
                  Explore all tracks
                  <ArrowRight className="ml-1.5 size-4" weight="bold" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:col-span-8">
              {tracks.map((track, index) => {
                const Icon = trackIconMap[track.icon] ?? Cube;
                return (
                  <article
                    key={track.id}
                    className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card/88 p-5 shadow-[0_16px_32px_-28px_rgba(27,35,29,0.92)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-34px_rgba(27,35,29,1)] dark:bg-card/65"
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="h-full w-full [background-image:repeating-linear-gradient(-35deg,transparent_0_10px,color-mix(in_srgb,var(--primary)_18%,transparent)_10px_11px)]" />
                    </div>
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <span className="rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                          0{index + 1}
                        </span>
                        <div className="flex size-10 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-primary">
                          <Icon className="size-5" weight="duotone" />
                        </div>
                      </div>
                      <h3 className="mt-4 font-heading text-xl leading-tight font-bold">
                        {track.name}
                      </h3>
                      <p className="mt-2 line-clamp-4 min-h-[4.8rem] text-sm leading-relaxed text-muted-foreground">
                        {track.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-3">
                        <span className="text-xs font-medium text-muted-foreground">
                          {track.courseCount} courses
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                          View path
                          <ArrowRight className="size-3.5" weight="bold" />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-border/70 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Verification Flow
              </p>
              <h2 className="mt-3 max-w-xl font-heading text-3xl font-black tracking-tight md:text-5xl">
                Learning events become durable proof.
              </h2>
              <div className="mt-6 overflow-hidden rounded-2xl border border-[#2a3844] bg-[#111923] shadow-[0_36px_78px_-42px_rgba(8,12,18,0.98)]">
                <div className="flex items-center justify-between border-b border-[#25303a] bg-[#0d141c] px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-rose-400/90" />
                    <span className="size-2 rounded-full bg-amber-300/90" />
                    <span className="size-2 rounded-full bg-emerald-400/90" />
                  </div>
                  <p className="font-mono text-[11px] tracking-wide text-slate-300 uppercase">
                    onchain-academy/src/instructions/complete_lesson.rs
                  </p>
                  <div className="w-8" />
                </div>
                <ol className="space-y-0.5 px-0 py-3 font-mono text-[13px] leading-relaxed text-slate-100 sm:text-sm">
                  {verificationSnippet.map((line, index) => (
                    <li
                      key={`${index}-${line}`}
                      className="grid grid-cols-[44px_1fr] gap-0 pr-4"
                    >
                      <span className="select-none border-r border-[#1e2933] pr-3 text-right text-xs text-slate-500">
                        {index + 1}
                      </span>
                      <span className="pl-4">
                        {line === "pub fn complete_lesson(" && (
                          <>
                            <span className="text-violet-300">pub fn</span>{" "}
                            <span className="text-sky-300">
                              complete_lesson
                            </span>
                            (
                          </>
                        )}
                        {line === "  ctx: Context<CompleteLesson>," && (
                          <>
                            ctx: <span className="text-amber-300">Context</span>
                            &lt;
                            <span className="text-amber-200">
                              CompleteLesson
                            </span>
                            &gt;,
                          </>
                        )}
                        {line === "  lesson_id: u32," && (
                          <>
                            lesson_id:{" "}
                            <span className="text-orange-300">u32</span>,
                          </>
                        )}
                        {line === ") -> Result<()> {" && (
                          <>
                            ) -&gt;{" "}
                            <span className="text-amber-200">Result</span>
                            &lt;()&gt; {"{"}
                          </>
                        )}
                        {line !== "pub fn complete_lesson(" &&
                          line !== "  ctx: Context<CompleteLesson>," &&
                          line !== "  lesson_id: u32," &&
                          line !== ") -> Result<()> {" &&
                          line}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="relative space-y-3 lg:col-span-5 lg:pt-6">
              <div className="pointer-events-none absolute bottom-5 left-5 top-10 w-px bg-gradient-to-b from-primary/35 via-primary/22 to-transparent" />
              {flowSteps.map(({ icon: Icon, title, detail }, index) => (
                <article
                  key={title}
                  className="relative rounded-2xl border border-border/70 bg-card/90 p-5 shadow-[0_18px_32px_-28px_rgba(27,35,29,0.95)] transition-transform duration-300 hover:-translate-y-1 dark:bg-card/65"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/12 text-primary">
                      <Icon className="size-5" weight="duotone" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        Step 0{index + 1}
                      </p>
                      <h3 className="mt-1 font-heading text-lg font-bold">
                        {title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {detail}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border/70 bg-muted/45 text-foreground">
        <div className="pointer-events-none absolute inset-0 opacity-34 [background-image:radial-gradient(circle_at_90%_8%,color-mix(in_srgb,var(--primary)_26%,transparent)_0%,transparent_48%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-22 [background-image:repeating-linear-gradient(-32deg,transparent_0_20px,color-mix(in_srgb,var(--border)_70%,transparent)_20px_21px)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="rounded-3xl border border-border/70 bg-card/86 p-6 shadow-[0_24px_90px_-58px_rgba(0,0,0,0.75)] backdrop-blur sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-stretch">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold tracking-[0.16em] text-secondary uppercase">
                  Build With Signal
                </p>
                <h2 className="mt-3 font-heading text-4xl leading-[1.02] font-black tracking-tight sm:text-5xl lg:text-6xl">
                  From guided lessons to provable builder reputation.
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Graduate from toy projects. Ship challenge-validated Solana
                  work, mint wallet-native credentials, and get recognized on a
                  public leaderboard.
                </p>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    size="lg"
                    asChild
                    className="h-14 min-w-[240px] px-9 text-base font-semibold"
                  >
                    <Link href="/courses">
                      Start learning now
                      <ArrowRight className="ml-2 size-4.5" weight="bold" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-14 min-w-[220px] border-foreground/20 bg-background/60 px-8 text-base font-semibold"
                  >
                    <Link href="/leaderboard">Open leaderboard</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 rounded-2xl border border-border/70 bg-background/62 p-4 sm:grid-cols-2 lg:grid-cols-1">
                <article className="rounded-xl border border-border/70 bg-card/78 p-3">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    Average completion
                  </p>
                  <p className="mt-1 text-2xl font-black tracking-tight">
                    98.1%
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Verified milestone execution
                  </p>
                </article>
                <article className="rounded-xl border border-border/70 bg-card/78 p-3">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    XP minted
                  </p>
                  <p className="mt-1 text-2xl font-black tracking-tight">
                    1.7M
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Non-transferable on-chain signal
                  </p>
                </article>
                <article className="rounded-xl border border-border/70 bg-card/78 p-3 sm:col-span-2 lg:col-span-1">
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    What you graduate with
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    Wallet-native Credential NFT + public builder ranking
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SuperteamFooter />
    </main>
  );
}
