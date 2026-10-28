'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronDown, Info, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import {
  api, Project, VisibilityLatestResponse, VisibilityOpportunity,
  VisibilitySetupResponse, VisibilityTrendPoint,
} from '@/lib/api';
import { PaymentGuard } from '@/components/PaymentGuard';
import { RunBanner } from '@/components/visibility/RunBanner';
import { SetupPanel } from '@/components/visibility/SetupPanel';
import { Scoreboard } from '@/components/visibility/Scoreboard';
import { Opportunities } from '@/components/visibility/Opportunities';
import { EngineCards } from '@/components/visibility/EngineCards';
import { TrendChart } from '@/components/visibility/TrendChart';
import { PromptList } from '@/components/visibility/PromptList';
import { BTN_PRIMARY, BTN_QUIET } from '@/components/ui/sticker';
import { formatRunDate } from '@/components/visibility/engines';

const RUN_POLL_MS = 3000;
const TREND_DAYS = 30;

type RunStatus = 'idle' | 'running' | 'completed' | 'failed';

export default function VisibilityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [setup, setSetup] = useState<VisibilitySetupResponse | null>(null);
  const [latest, setLatest] = useState<VisibilityLatestResponse | null>(null);
  const [trend, setTrend] = useState<VisibilityTrendPoint[]>([]);
  const [opportunities, setOpportunities] = useState<VisibilityOpportunity[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showManage, setShowManage] = useState(false);

  const [runStatus, setRunStatus] = useState<RunStatus>('idle');
  const [runProgress, setRunProgress] = useState(0);
  const [runMessage, setRunMessage] = useState('');

  // ---- Data loading ----
  // The three result endpoints are independent, so one failing shouldn't blank
  // out the other two.
  const loadResults = useCallback(async (): Promise<VisibilityLatestResponse | null> => {
    const [latestRes, trendRes, oppRes] = await Promise.allSettled([
      api.getVisibilityLatest(projectId),
      api.getVisibilityTrend(projectId, TREND_DAYS),
      api.getVisibilityOpportunities(projectId),
    ]);
    if (latestRes.status === 'fulfilled') setLatest(latestRes.value);
    if (trendRes.status === 'fulfilled') setTrend(trendRes.value);
    if (oppRes.status === 'fulfilled') setOpportunities(oppRes.value);
    return latestRes.status === 'fulfilled' ? latestRes.value : null;
  }, [projectId]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!projectId || isNaN(parseInt(projectId, 10))) {
      toast.error('Invalid project');
      router.push('/projects');
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    (async () => {
      try {
        const [projectData, setupData] = await Promise.all([
          api.getProject(projectId),
          api.getVisibilitySetup(projectId),
        ]);
        if (cancelled) return;
        setProject(projectData);
        setSetup(setupData);

        // A run started in another tab (or before a refresh) should resume polling.
        try {
          const statusData = await api.getVisibilityStatus(projectId);
          if (cancelled) return;
          if (statusData.status === 'running') {
            setRunStatus('running');
            setRunProgress(statusData.progress || 0);
            setRunMessage(statusData.message || '');
          }
        } catch { /* status is a nice-to-have on first paint */ }

        if (setupData.prompts.length > 0) {
          await loadResults();
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load AI visibility for this project.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  // ---- Run control ----
  const startRun = useCallback(async () => {
    if (!projectId || runStatus === 'running') return;
    try {
      const response = await api.runVisibilityCheck(projectId);
      if (response.status === 'started') {
        setRunStatus('running');
        setRunProgress(0);
        setRunMessage('Asking the models…');
        toast.info('Checking what AI assistants say about you');
      } else if (response.status === 'already_running') {
        setRunStatus('running');
        toast.warning('A visibility check is already running');
      } else if (response.status === 'cooldown') {
        toast.error(response.message || 'Visibility checks are limited to once every 6 hours');
      } else if (response.status === 'no_prompts') {
        toast.error(response.message || 'Add at least one question before running a check');
        setShowManage(true);
      }
    } catch (error) {
      toast.error('Could not start the visibility check', {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }, [projectId, runStatus]);

  // ---- Run polling: setTimeout chain, paused while the tab is hidden ----
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (runStatus !== 'running' || !projectId) return;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      if (document.hidden) {
        pollTimer.current = setTimeout(tick, RUN_POLL_MS);
        return;
      }
      try {
        const updated = await api.getVisibilityStatus(projectId);
        if (stopped) return;
        setRunProgress(updated.progress || 0);
        setRunMessage(updated.message || '');
        if (updated.status === 'completed' || updated.status === 'failed') {
          // Results are loaded before the status flips: setRunStatus tears this
          // effect down, and anything awaited after that would see stopped=true.
          if (updated.status === 'completed') {
            const fresh = await loadResults();
            if (stopped) return;
            setRunStatus('completed');
            // A percentage never travels without its denominator, toasts
            // included. "0%" reads as a verdict, "0 of 12 answers" reads as a
            // sample.
            toast.success(
              fresh && fresh.run_id !== null && fresh.brand.total_checks > 0
                ? `You are recommended in ${fresh.brand.mention_count} of ${fresh.brand.total_checks} AI answers (${fresh.brand.visibility_pct}%)`
                : 'Visibility check complete'
            );
          } else {
            setRunStatus('failed');
            toast.error('Visibility check failed', {
              description: updated.message || 'Try again in a few minutes.',
            });
          }
          return;
        }
      } catch { /* transient poll error — keep trying */ }
      pollTimer.current = setTimeout(tick, RUN_POLL_MS);
    };

    pollTimer.current = setTimeout(tick, RUN_POLL_MS);
    return () => {
      stopped = true;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runStatus, projectId]);

  // ---- Prompt / competitor editing ----
  const handleAddPrompt = useCallback(async (text: string): Promise<boolean> => {
    if (!setup) return false;
    if (setup.prompts.some((p) => p.text.trim().toLowerCase() === text.trim().toLowerCase())) {
      toast.info('You are already tracking that question');
      return false;
    }
    try {
      const created = await api.addVisibilityPrompt(projectId, text);
      setSetup((prev) => (prev ? { ...prev, prompts: [...prev.prompts, created] } : prev));
      return true;
    } catch (error) {
      toast.error('Could not add that question', {
        description: error instanceof Error ? error.message : undefined,
      });
      return false;
    }
  }, [projectId, setup]);

  const handleRemovePrompt = useCallback(async (promptId: number) => {
    try {
      await api.deleteVisibilityPrompt(promptId);
      setSetup((prev) => (prev ? { ...prev, prompts: prev.prompts.filter((p) => p.id !== promptId) } : prev));
    } catch (error) {
      toast.error('Could not remove that question', {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }, []);

  const handleAddCompetitor = useCallback(async (name: string): Promise<boolean> => {
    if (!setup) return false;
    if (setup.competitors.some((c) => c.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      toast.info('You are already tracking that competitor');
      return false;
    }
    try {
      const created = await api.addVisibilityCompetitor(projectId, name);
      setSetup((prev) => (prev ? { ...prev, competitors: [...prev.competitors, created] } : prev));
      return true;
    } catch (error) {
      toast.error('Could not add that competitor', {
        description: error instanceof Error ? error.message : undefined,
      });
      return false;
    }
  }, [projectId, setup]);

  const handleRemoveCompetitor = useCallback(async (competitorId: number) => {
    try {
      await api.deleteVisibilityCompetitor(competitorId);
      setSetup((prev) => (prev ? { ...prev, competitors: prev.competitors.filter((c) => c.id !== competitorId) } : prev));
    } catch (error) {
      toast.error('Could not remove that competitor', {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }, []);

  // ---- Derived ----
  const hasResults = !!latest && latest.run_id !== null;
  const running = runStatus === 'running';

  // Drives the "you have gaps but no matching threads" state in Opportunities.
  const hasGaps = useMemo(() => {
    if (!latest) return false;
    return latest.prompts.some((p) => p.results.some((r) => !r.brand_mentioned));
  }, [latest]);

  const brandName = latest?.brand.name || project?.name || '';

  // Opportunities hides itself when there is nothing to act on. The page needs
  // to know the same thing so the elevated band around it is not an empty box.
  const showAction = opportunities.length > 0 || hasGaps;

  // A single point is a dot, not a trend, and TrendChart hides itself below two.
  // Only pair it with the engine strip when it is actually going to render.
  const hasTrend = trend.length >= 2;

  // EngineCards hides itself the same way. Both halves have to be present
  // before the band splits into two columns, or the survivor sits in a
  // half-empty grid.
  const hasEngines = (latest?.by_engine.length ?? 0) > 0;

  // How much one extra mention would move a percentage in this run. At 12
  // answers it is 8 points, which is why a five-way tie at 25% is a sample-size
  // artifact rather than a standing. Said out loud rather than left implied.
  const pointsPerAnswer = latest && latest.brand.total_checks > 0
    ? Math.round(100 / latest.brand.total_checks)
    : 0;
  const showSampleNote =
    pointsPerAnswer >= 2 && (latest?.competitors.length ?? 0) > 0 && hasEngines;

  const setupPanelProps = {
    brandName: project?.name || '',
    prompts: setup?.prompts || [],
    competitors: setup?.competitors || [],
    suggestedPrompts: setup?.suggested_prompts || [],
    onAddPrompt: handleAddPrompt,
    onRemovePrompt: handleRemovePrompt,
    onAddCompetitor: handleAddCompetitor,
    onRemoveCompetitor: handleRemoveCompetitor,
    onRun: startRun,
    running,
  };

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[1100px]">
        {/* Header: what this is, when it was last checked, and the one action. */}
        <header className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink-400">{project ? project.name : '\u00a0'}</p>
            <h1 className="font-play text-[30px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
              AI visibility
            </h1>
            <p className="mt-1.5 text-[13px] text-ink-400">
              Whether ChatGPT, Gemini, Perplexity and Claude recommend you when buyers ask.
              {hasResults && latest?.completed_at && (
                <> Last checked <span className="text-ink-600">{formatRunDate(latest.completed_at)}</span>.</>
              )}
            </p>
          </div>

          {hasResults && (
            <button onClick={startRun} disabled={running} className={BTN_PRIMARY}>
              {running
                ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              {running ? 'Checking' : 'Check again'}
            </button>
          )}
        </header>

        {running && <RunBanner progress={runProgress} message={runMessage} />}

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading AI visibility">
            <div className="animate-pulse rounded-2xl border-2 border-[#1c1917]/[0.08] bg-white p-6">
              <div className="mb-4 h-3 w-32 rounded bg-cream" />
              <div className="mb-4 h-12 w-40 rounded-xl bg-cream" />
              <div className="h-3 w-2/3 rounded bg-cream" />
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border-2 border-[#1c1917]/[0.08] bg-white p-5">
                <div className="mb-3 h-4 w-3/4 rounded bg-cream" />
                <div className="h-3 w-1/2 rounded bg-cream" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="py-20 text-center">
            <p className="text-[15px] font-semibold text-ink-900">Could not load AI visibility</p>
            <p className="mt-1.5 text-[13px] text-ink-400">{loadError}</p>
            <button onClick={() => window.location.reload()} className={`${BTN_PRIMARY} mt-5`}>
              Try again
            </button>
          </div>
        ) : !hasResults ? (
          /* Empty state: the pitch, the suggested questions, and the first run. */
          <SetupPanel variant="onboarding" {...setupPanelProps} />
        ) : (
          /* Reading order, widest and airiest first: the standing, then the
             thing to do about it, then the measurement that backs it up. */
          <div className="pb-10">
            {/* ── The standing ── */}
            <Scoreboard
              brand={latest!.brand}
              competitors={latest!.competitors}
              completedAt={latest!.completed_at}
            />

            {showSampleNote && (
              <p className="mt-3 flex items-start gap-2 px-1 text-[12px] leading-snug text-ink-400">
                <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  This run asked{' '}
                  <span className="font-semibold text-ink-600 tabular-nums">{latest!.prompts.length}</span>{' '}
                  question{latest!.prompts.length === 1 ? '' : 's'} across{' '}
                  <span className="font-semibold text-ink-600 tabular-nums">{latest!.by_engine.length}</span>{' '}
                  assistant{latest!.by_engine.length === 1 ? '' : 's'}, so one extra mention moves any name by
                  about <span className="font-semibold text-ink-600 tabular-nums">{pointsPerAnswer}</span> points.
                  Read close positions as ties, not as a ranking. Add questions to sharpen it.
                </span>
              </p>
            )}

            {/* ── Close the gap. The one section that asks for a decision, so it
                 gets its own warm panel instead of another card in the stack.
                 The tint is orange-100/60, not orange-50: orange-50 (#fff4f0)
                 sits at 1.02:1 against the page background so it does not read
                 as a tint at all, and it erases the orange-50 plates
                 Opportunities draws on top of it. orange-100/60 lands on the
                 same surface step the app already uses for cream, so the band
                 reads as a panel and its contents keep their own surfaces. ── */}
            {showAction && (
              <div className="mt-8 rounded-2xl border-2 border-[#1c1917]/[0.12] bg-[#fff4f0] p-4 sm:p-6">
                <Opportunities
                  items={opportunities}
                  hasGaps={hasGaps}
                  onOpenLeads={() => router.push(`/mentions/${projectId}`)}
                />
              </div>
            )}

            {/* ── The measurement behind the number. Compact, and paired into one
                 band when there is a trend worth showing. ── */}
            <div className={`mt-8 grid items-start gap-5 ${hasTrend && hasEngines ? 'lg:grid-cols-2' : ''}`}>
              <EngineCards byEngine={latest!.by_engine} />
              <TrendChart data={trend} brandName={brandName} />
            </div>

            <div className="mt-8">
              <PromptList prompts={latest!.prompts} />
            </div>

            {/* Editing questions and competitors stays available, just out of the way. */}
            <div className="mt-8">
              <button
                onClick={() => setShowManage((v) => !v)}
                aria-expanded={showManage}
                className={`${BTN_QUIET} -ml-2.5`}
              >
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 motion-reduce:transition-none ${showManage ? 'rotate-180' : ''}`} aria-hidden="true" />
                {showManage ? 'Hide setup' : 'Edit questions and competitors'}
              </button>
              {showManage && (
                <div className="mt-3">
                  <SetupPanel variant="manage" {...setupPanelProps} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PaymentGuard>
  );
}
