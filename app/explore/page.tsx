'use client';

/**
 * /explore?url=<encoded>&session=<id>
 *
 * The public, unauthenticated onboarding funnel. A visitor pastes their site on
 * the landing page and lands here, where they watch us work through five steps
 * on their own business before anyone mentions money.
 *
 * The reveal is choreographed playback over real data, not a live agent stream.
 * We POST /start once, then poll a status endpoint and animate the transitions.
 */

import { Suspense, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExploreShell, type ExploreFatal } from '@/components/explore/ExploreShell';
import { PhaseCompany } from '@/components/explore/PhaseCompany';
import { PhaseCommunities } from '@/components/explore/PhaseCommunities';
import { PhaseVisibility } from '@/components/explore/PhaseVisibility';
import { PhaseThreads } from '@/components/explore/PhaseThreads';
import { OfferBar } from '@/components/explore/OfferBar';
import { ReadyPanel } from '@/components/explore/ReadyPanel';
import {
  getOnboarding,
  isOnboardingError,
  isTerminalPhase,
  ONBOARDING_POLL_MS,
  startOnboarding,
  type OnboardingSession,
} from '@/lib/onboarding';

// A handful of dropped polls is normal on a flaky connection. Give up only once
// it is clearly not coming back, rather than flashing an error on one blip.
const MAX_CONSECUTIVE_POLL_FAILURES = 8;

// How long each revealed step holds the canvas before the next one takes it.
// Long enough to read the card, short enough that five steps stay under a
// couple of minutes even when the backend finishes early.
const STEP_DWELL_MS = 3200;

function ExploreFunnel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlParam = searchParams?.get('url') ?? '';
  const sessionParam = searchParams?.get('session') ?? '';

  const [sessionId, setSessionId] = useState<string>(sessionParam);
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [fatal, setFatal] = useState<ExploreFatal | null>(null);

  // Once ?session= lands in the address bar it is the source of truth. Without
  // this, the id captured by useState at mount is the only one we ever poll:
  // router.replace below can remount this component, and on that mount the
  // initial state can be read before the new search params are visible, which
  // leaves sessionId empty and the poll chain dead after a single request.
  // Observed live: the backend reached phase 2 while the browser had made
  // exactly one GET.
  useEffect(() => {
    if (sessionParam && sessionParam !== sessionId) setSessionId(sessionParam);
  }, [sessionParam, sessionId]);

  /* ---- Start, or resume ------------------------------------------------ */

  // Refs survive React's development double mount, so this genuinely fires the
  // rate limited POST once per page load.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // ?session= means we are resuming, the run already exists.
    if (sessionParam) return;

    if (!urlParam.trim()) {
      setFatal({
        title: 'We need a website first',
        message: 'Paste your website address on the homepage and SneakyGuy will get to work on it.',
      });
      return;
    }

    startOnboarding(urlParam)
      .then((response) => {
        setSessionId(response.session_id);
        // Park the session id in the URL so a refresh resumes the same run
        // instead of burning another one against the hourly cap. This goes
        // through the router rather than history.replaceState, because the app
        // router rewrites the address bar from its own canonical URL on the
        // next render and a raw replaceState gets silently dropped.
        const params = new URLSearchParams(window.location.search);
        params.set('session', response.session_id);
        router.replace(`/explore?${params.toString()}`, { scroll: false });
      })
      .catch((error: unknown) => {
        if (isOnboardingError(error) && error.isRateLimited) {
          // Neutral title on purpose. The server sends one of three different
          // 429 reasons (per IP hour, per IP day, global capacity) and the
          // wording differs, so a title that names the hourly cap would either
          // contradict the message under it or repeat it word for word.
          setFatal({
            title: 'Hold on a moment',
            message: error.message,
          });
          return;
        }
        setFatal({
          title: 'We could not start that run',
          message: isOnboardingError(error) ? error.message : 'Something went wrong on our side. Try again in a moment.',
        });
      });
  }, [urlParam, sessionParam, router]);

  /* ---- Polling --------------------------------------------------------- */

  // setTimeout chain rather than setInterval, so a slow response can never
  // stack requests. Pauses while the tab is hidden and cleans up on unmount.
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId || fatal) return;
    let stopped = false;
    let failures = 0;

    const tick = async () => {
      if (stopped) return;

      if (document.hidden) {
        pollTimer.current = setTimeout(tick, ONBOARDING_POLL_MS);
        return;
      }

      try {
        const next = await getOnboarding(sessionId);
        if (stopped) return;
        failures = 0;
        setSession(next);
        // "ready" and "failed" never change again, so stop the chain.
        if (isTerminalPhase(next.phase)) return;
      } catch (error) {
        if (stopped) return;

        if (isOnboardingError(error) && error.isNotFound) {
          setFatal({
            title: 'That run has expired',
            message: 'We only keep these for a short while. Start a fresh one and it takes about a minute.',
          });
          return;
        }

        failures += 1;
        if (failures >= MAX_CONSECUTIVE_POLL_FAILURES) {
          setFatal({
            title: 'We lost the connection',
            message: 'Your run may still be going. Refresh the page to pick it back up.',
            action: (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="inline-flex h-10 items-center rounded-full bg-[#ff4500] px-5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
              >
                Refresh
              </button>
            ),
          });
          return;
        }
      }

      pollTimer.current = setTimeout(tick, ONBOARDING_POLL_MS);
    };

    // Read once straight away, the canvas should not sit empty for 1500ms.
    tick();

    return () => {
      stopped = true;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [sessionId, fatal]);

  // ---- Paced reveal ------------------------------------------------------
  //
  // The backend finishes a run in about a minute and the phase index jumps
  // ahead in bursts: communities lands almost instantly after research, so
  // rendering the raw index put the rail on "Ready" while the visitor was
  // still reading step one. Steps two, three and four never had a moment.
  //
  // So the reveal walks forward one step at a time and holds each one, exactly
  // the way explee does it. The work is already done, the pacing is the show.
  const rawIndex = session?.phase_index ?? 0;
  const [displayIndex, setDisplayIndex] = useState(0);
  // Set once the visitor clicks a step. From then on the rail is theirs and we
  // stop dragging them forward mid-read.
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual || displayIndex >= rawIndex) return;
    const t = setTimeout(() => setDisplayIndex((i) => Math.min(i + 1, rawIndex)), STEP_DWELL_MS);
    return () => clearTimeout(t);
  }, [displayIndex, rawIndex, manual]);

  const handleCta = () => {
    try {
      if (session?.session_id) sessionStorage.setItem('onboarding_session', session.session_id);
      const target = session?.url || urlParam;
      if (target) sessionStorage.setItem('pending_analyze_url', target);
    } catch {
      // Private mode can refuse storage. The sign up still has to happen, and
      // /projects falls back to its own empty state without the stashed URL.
    }
    router.push('/login');
  };

  // Exactly one card owns the canvas. Stacking all five turned the funnel into
  // a scroll the visitor never scrolled.
  const card = () => {
    if (!session) return null;
    // A failed run is over. Rendering the next phase's skeleton under the error
    // shimmers as though work is still happening, which is exactly what the
    // error just said is not true.
    if (session.phase === 'failed') return null;
    switch (displayIndex) {
      case 0:
        return <PhaseCompany url={session.url || urlParam} company={session.company} />;
      case 1:
        return (
          <PhaseCommunities
            keywords={session.keywords ?? []}
            subreddits={session.subreddits ?? []}
            loading={rawIndex > 1 ? false : undefined}
          />
        );
      case 2:
        return (
          <PhaseVisibility
            visibility={session.visibility}
            brandName={session.company?.name}
            loading={rawIndex > 2 ? false : undefined}
          />
        );
      case 3:
        return (
          <PhaseThreads threads={session.threads ?? []} loading={rawIndex > 3 ? false : undefined} />
        );
      default:
        return <ReadyPanel session={session} onCta={handleCta} />;
    }
  };

  return (
    <ExploreShell session={session} url={urlParam} fatal={fatal} displayIndex={displayIndex}>
      {session ? (
        <div className="space-y-6">
          <OfferBar
            phaseIndex={displayIndex}
            phase={session.phase}
            onCta={handleCta}
            brandName={session.company?.name}
            keywordCount={session.keywords?.length ?? 0}
            subredditCount={session.subreddits?.length ?? 0}
          />

          {/* Steps already revealed are clickable, so nothing is lost to pacing. */}
          {session.phase !== 'failed' && (
          <StepDots
            count={5}
            active={displayIndex}
            reached={rawIndex}
            onPick={(i) => {
              setManual(true);
              setDisplayIndex(i);
            }}
          />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={displayIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {card()}
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}
    </ExploreShell>
  );
}

/** Small dot row under the offer bar: jump back to any step already revealed. */
function StepDots({
  count,
  active,
  reached,
  onPick,
}: {
  count: number;
  active: number;
  reached: number;
  onPick: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }, (_, i) => {
        const available = i <= reached;
        return (
          <button
            key={i}
            type="button"
            disabled={!available}
            onClick={() => onPick(i)}
            aria-label={`Step ${i + 1}`}
            aria-current={i === active ? 'step' : undefined}
            className={
              i === active
                ? 'h-1.5 w-6 rounded-full bg-[#ff4500] transition-all'
                : available
                  ? 'h-1.5 w-1.5 rounded-full bg-black/25 transition-all hover:bg-black/50'
                  : 'h-1.5 w-1.5 rounded-full bg-black/10'
            }
          />
        );
      })}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreBooting />}>
      <ExploreFunnel />
    </Suspense>
  );
}

/** Matches the shell's canvas so the Suspense hand off is not a white flash. */
function ExploreBooting() {
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <div className="flex min-h-screen items-center justify-center">
        <span className="font-mono text-[12.5px] text-[#8a827b]">warming up</span>
      </div>
    </div>
  );
}
