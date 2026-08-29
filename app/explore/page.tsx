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

  // Once a phase has produced its data the card stays on screen, so the canvas
  // accumulates rather than swapping. Passing `loading={false}` past a phase is
  // what stops a genuinely empty result (no threads found, every engine timed
  // out) from shimmering forever.
  const phaseIndex = session?.phase_index ?? 0;
  const done = (index: number) => phaseIndex > index || session?.phase === 'ready';

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

  return (
    <ExploreShell session={session} url={urlParam} fatal={fatal}>
      {session ? (
        <div className="space-y-6">
          <OfferBar
            phaseIndex={phaseIndex}
            phase={session.phase}
            onCta={handleCta}
            brandName={session.company?.name}
            keywordCount={session.keywords?.length ?? 0}
            subredditCount={session.subreddits?.length ?? 0}
          />

          <PhaseCompany url={session.url || urlParam} company={session.company} />

          {phaseIndex >= 1 && (
            <PhaseCommunities
              keywords={session.keywords ?? []}
              subreddits={session.subreddits ?? []}
              loading={done(1) ? false : undefined}
            />
          )}

          {phaseIndex >= 2 && (
            <PhaseVisibility
              visibility={session.visibility}
              brandName={session.company?.name}
              loading={done(2) ? false : undefined}
            />
          )}

          {phaseIndex >= 3 && (
            <PhaseThreads
              threads={session.threads ?? []}
              loading={done(3) ? false : undefined}
            />
          )}

          {session.phase === 'ready' && <ReadyPanel session={session} onCta={handleCta} />}
        </div>
      ) : null}
    </ExploreShell>
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
    <div className="min-h-screen bg-[#0c0a09]">
      <div className="flex min-h-screen items-center justify-center">
        <span className="font-mono text-[12.5px] text-[#78716c]">warming up</span>
      </div>
    </div>
  );
}
