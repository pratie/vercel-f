'use client';

/**
 * The dark, full bleed chrome for /explore.
 *
 * This component is purely presentational. It owns the layout, the palette and
 * the motion, and it knows nothing about polling. Feed it the latest polled
 * session and two slots:
 *
 *   <ExploreShell session={session} findings={<Findings session={session} />}>
 *     <StepCards session={session} />
 *   </ExploreShell>
 *
 *   findings  -> left rail, under the agent log. The accumulating summary that
 *                grows as phases complete. Mirrored below the canvas on mobile,
 *                where the rail is hidden.
 *   children  -> main canvas, under the step rail. The per step content cards.
 *
 * Palette is deliberately local to this flow. The rest of the app stays warm
 * and light, so every colour here is a literal arbitrary value rather than a
 * Tailwind config key.
 */

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { domainFromUrl, ONBOARDING_STEP_COUNT, type OnboardingSession } from '@/lib/onboarding';
import { AgentLog, LiveDot } from './AgentLog';
import { EXPLORE_STEPS, StepRail } from './StepRail';

/** A fatal, terminal problem. Renders instead of the funnel. */
export interface ExploreFatal {
  title: string;
  message: string;
  /** Optional button or link. Falls back to a "start over" link home. */
  action?: ReactNode;
}

export interface ExploreShellProps {
  /** Latest poll response, or null while the very first request is in flight. */
  session: OnboardingSession | null;
  /** The URL being analysed. Used for the header before `session` arrives. */
  url?: string;
  /** Set to take over the whole screen with an error state. */
  fatal?: ExploreFatal | null;
  /** Left rail slot, under the agent log. */
  findings?: ReactNode;
  /** Main canvas slot, under the step rail. */
  children?: ReactNode;
  /**
   * Step the UI is REVEALING, which lags the backend on purpose. The run can
   * finish in a minute and jump the rail straight to "Ready", so the visitor
   * never sees steps two through four happen. The page paces the reveal and
   * passes it here. Falls back to the raw phase index when unset.
   */
  displayIndex?: number;
}

export function ExploreShell({ session, url, fatal, findings, children, displayIndex }: ExploreShellProps) {
  if (fatal) return <ExploreFatalScreen fatal={fatal} />;

  const phase = session?.phase ?? 'research_company';
  const rawIndex = session?.phase_index ?? 0;
  const phaseIndex = displayIndex ?? rawIndex;
  const log = session?.log ?? [];
  const domain = domainFromUrl(session?.url ?? url ?? '');
  const ready = phase === 'ready';
  const failed = phase === 'failed';

  return (
    <div className="min-h-screen bg-[#0c0a09] text-[#d6d3d1] lg:flex">
      {/* ---- Left rail ------------------------------------------------- */}
      <aside className="hidden border-r border-white/[0.08] lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[300px] lg:shrink-0 lg:flex-col">
        <div className="flex h-16 shrink-0 items-center border-b border-white/[0.08] px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo-dark.png" alt="" width={34} height={21} priority className="h-auto w-[34px] no-outline" />
            <span className="text-[14px] font-semibold tracking-tight text-[#fafaf9]">SneakyGuy</span>
          </Link>
        </div>

        <div className="shrink-0 border-b border-white/[0.08] px-5 py-5">
          <AgentLog log={log} phase={phase} phaseIndex={phaseIndex} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{findings}</div>
      </aside>

      {/* ---- Main canvas ------------------------------------------------ */}
      {/* pb clears the fixed OfferBar so the last card and the mobile log never sit under it. */}
      <main className="min-w-0 flex-1 pb-28">
        <div className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#0c0a09]/[0.92] px-5 py-4 backdrop-blur-md sm:px-8">
          <div className="mb-3.5 flex items-center gap-2.5 lg:mb-4">
            {/* The logo also has to carry the header below lg, where the rail
                is gone. */}
            <Link href="/" className="flex items-center gap-2 lg:hidden">
              <Image src="/logo-dark.png" alt="SneakyGuy" width={30} height={19} priority className="h-auto w-[30px] no-outline" />
            </Link>
            {domain && (
              <p className="min-w-0 truncate font-mono text-[12px] text-[#78716c]">
                <span className="text-[#a8a29e]">{domain}</span>
              </p>
            )}
          </div>

          <StepRail activeIndex={phaseIndex} complete={ready && phaseIndex >= 4} failed={failed} />
        </div>

        <div className="px-5 py-7 sm:px-8 sm:py-9">
          {failed && session?.error && <ExploreFailureNote message={session.error} />}
          {children ?? <ExploreCanvasWaiting phaseIndex={phaseIndex} ready={ready} failed={failed} />}
        </div>

        {/* Below lg the rail is hidden, so the narration and the findings have
            to live in the canvas or mobile visitors watch a blank screen. */}
        <div className="border-t border-white/[0.08] px-5 py-6 sm:px-8 lg:hidden">
          <AgentLog log={log} phase={phase} phaseIndex={phaseIndex} maxLines={4} />
          {findings && <div className="mt-6">{findings}</div>}
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub screens                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Full screen terminal error. Used for a rate limited start, an expired session
 * or a missing url param, all of which mean there is nothing to animate.
 */
export function ExploreFatalScreen({ fatal }: { fatal: ExploreFatal }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0a09] px-6 text-center">
      <Image src="/logo-dark.png" alt="SneakyGuy" width={34} height={21} priority className="h-auto w-[34px] no-outline" />

      <div className="mt-8 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-[#1c1917]">
        <AlertTriangle className="h-4 w-4 text-[#a8a29e]" />
      </div>

      <h1 className="mt-5 max-w-md text-[20px] font-semibold tracking-tight text-[#fafaf9] sm:text-[22px]">
        {fatal.title}
      </h1>
      <p className="mt-2.5 max-w-md text-[14px] leading-relaxed text-[#a8a29e]">{fatal.message}</p>

      <div className="mt-7">
        {fatal.action ?? (
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-full bg-[#ff4500] px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Back to SneakyGuy
          </Link>
        )}
      </div>
    </div>
  );
}

/** Inline banner for a run that died partway through. */
function ExploreFailureNote({ message }: { message: string }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#1c1917] p-4">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#a8a29e]" />
      <div className="min-w-0">
        <p className="text-[13.5px] font-medium text-[#fafaf9]">We could not finish this run</p>
        <p className="mt-1 text-[13px] leading-relaxed text-[#a8a29e]">{message}</p>
      </div>
    </div>
  );
}

/**
 * Placeholder for the canvas before the content cards are wired in. It shows
 * the current step and nothing else, so an unfinished integration reads as calm
 * rather than broken. Passing `children` replaces it entirely.
 */
function ExploreCanvasWaiting({
  phaseIndex,
  ready,
  failed,
}: {
  phaseIndex: number;
  ready: boolean;
  failed: boolean;
}) {
  const label = EXPLORE_STEPS[Math.max(0, Math.min(phaseIndex, EXPLORE_STEPS.length - 1))];

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center text-center">
      {!failed && <LiveDot pulse={!ready} />}
      <p className="mt-4 font-mono text-[12.5px] text-[#78716c]">
        {failed ? 'stopped' : ready ? 'all done' : `step ${Math.min(phaseIndex + 1, ONBOARDING_STEP_COUNT)} of ${ONBOARDING_STEP_COUNT}`}
      </p>
      <p className={cn('mt-1.5 text-[17px] font-medium tracking-tight text-[#d6d3d1]')}>{label}</p>
    </div>
  );
}
