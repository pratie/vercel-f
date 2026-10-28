'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { BarChart3, Download, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { api, Project } from '@/lib/api';
import { PaymentGuard } from '@/components/PaymentGuard';
import {
  Mention, transformRawMention, isUnscored, isHighIntent, exportMentionsToCSV,
} from '@/lib/mentions';
import { MentionCard } from '@/components/mentions/MentionCard';
import { LeadInbox } from '@/components/mentions/LeadInbox';
import { ScanBanner } from '@/components/mentions/ScanBanner';
import { BTN_PRIMARY, BTN_QUIET, BTN_SECONDARY } from '@/components/ui/sticker';
import { FilterBar, MentionFilters, DEFAULT_FILTERS, SortKey, TriageTab } from '@/components/mentions/FilterBar';
import { useTriage } from '@/lib/useTriage';

const MENTIONS_PER_PAGE = 25;
const SCAN_POLL_MS = 3000;

type ScanStatus = 'idle' | 'scanning' | 'completed' | 'failed';

export default function MentionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params?.projectId as string;

  const [allMentions, setAllMentions] = useState<Mention[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(MENTIONS_PER_PAGE);

  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');

  // Triage state (viewed / replied) is shared with the queue pages.
  const { viewed: viewedPosts, published: publishedComments, dmSent, markViewed, markPublished, markDmSent } = useTriage(projectId);
  const [rescoring, setRescoring] = useState(false);
  const leadParam = searchParams?.get('lead');
  const initialSelectedId = leadParam ? parseInt(leadParam, 10) : null;

  // Filters initialise from the URL so filtered views survive refresh and can be shared.
  const [filters, setFilters] = useState<MentionFilters>(() => ({
    query: searchParams?.get('q') ?? DEFAULT_FILTERS.query,
    subreddit: searchParams?.get('sr') ?? DEFAULT_FILTERS.subreddit,
    intent: searchParams?.get('intent') ?? DEFAULT_FILTERS.intent,
    sort: (searchParams?.get('sort') as SortKey) ?? DEFAULT_FILTERS.sort,
    tab: (searchParams?.get('tab') as TriageTab) ?? DEFAULT_FILTERS.tab,
  }));

  const updateFilters = useCallback((next: Partial<MentionFilters>) => {
    setFilters((prev) => {
      const merged = { ...prev, ...next };
      const url = new URL(window.location.href);
      const set = (key: string, value: string, def: string) => {
        if (value && value !== def) url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      };
      set('q', merged.query, DEFAULT_FILTERS.query);
      set('sr', merged.subreddit, DEFAULT_FILTERS.subreddit);
      set('intent', merged.intent, DEFAULT_FILTERS.intent);
      set('sort', merged.sort, DEFAULT_FILTERS.sort);
      set('tab', merged.tab, DEFAULT_FILTERS.tab);
      window.history.replaceState(null, '', url.toString());
      return merged;
    });
    setVisibleCount(MENTIONS_PER_PAGE);
  }, []);

  // ---- Data loading ----
  const loadMentions = useCallback(async () => {
    const raw = await api.getMentions(projectId, 0, 5000);
    const transformed = raw.map(transformRawMention);
    setAllMentions(transformed);
    return transformed;
  }, [projectId]);

  const startScan = useCallback(async (silent = false) => {
    if (!projectId) return;
    try {
      const response = await api.analyzeReddit({
        brand_id: projectId,
        keywords: project?.keywords || [],
        subreddits: project?.subreddits || [],
        time_period: 'month',
        limit: 1000,
      });
      if (response.status === 'started') {
        setScanStatus('scanning');
        setScanProgress(0);
        setScanMessage('Starting scan…');
        if (!silent) toast.info('Scanning Reddit for new leads');
      } else if (response.status === 'already_running') {
        setScanStatus('scanning');
        if (!silent) toast.warning('A scan is already in progress');
      } else if (response.status === 'cooldown') {
        if (!silent) toast.error(response.message || 'Scans are limited to once every 10 minutes');
      }
    } catch (error) {
      if (!silent) toast.error('Failed to start scan', { description: error instanceof Error ? error.message : undefined });
    }
  }, [projectId, project]);

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
        const projectData = await api.getProject(projectId);
        if (cancelled) return;
        setProject(projectData);
        setScanStatus((projectData.analysis_status as ScanStatus) || 'idle');
        setScanProgress(projectData.analysis_progress || 0);
        setScanMessage(projectData.analysis_status_message || '');

        const transformed = await loadMentions();
        if (cancelled) return;

        // Brand-new project: kick off the first scan automatically.
        if (transformed.length === 0 && projectData.analysis_status === 'idle') {
          startScan(true);
          setScanStatus('scanning');
          setScanMessage('Running your first Reddit scan…');
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load this project.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  // ---- Scan polling: setTimeout chain, paused while the tab is hidden ----
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (scanStatus !== 'scanning' || !projectId) return;
    let stopped = false;

    const tick = async () => {
      if (stopped) return;
      if (document.hidden) {
        pollTimer.current = setTimeout(tick, SCAN_POLL_MS);
        return;
      }
      try {
        const updated = await api.getProject(projectId);
        if (stopped) return;
        setScanProgress(updated.analysis_progress || 0);
        setScanMessage(updated.analysis_status_message || '');
        const status = (updated.analysis_status as ScanStatus) || 'idle';
        if (status === 'completed' || status === 'failed') {
          setScanStatus(status);
          const before = allMentions.length;
          const after = await loadMentions();
          if (status === 'completed') {
            const found = after.length - before;
            toast.success(found > 0 ? `Scan complete. ${found} new lead${found === 1 ? '' : 's'} found` : 'Scan complete. No new leads this time');
          } else {
            toast.error('Scan failed', { description: updated.analysis_status_message || 'Try again in a few minutes.' });
          }
          return;
        }
      } catch { /* transient poll error — keep trying */ }
      pollTimer.current = setTimeout(tick, SCAN_POLL_MS);
    };

    pollTimer.current = setTimeout(tick, SCAN_POLL_MS);
    return () => {
      stopped = true;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanStatus, projectId]);

  // ---- Re-scoring placeholder leads ----
  const handleRescore = useCallback(async () => {
    if (rescoring) return;
    setRescoring(true);
    try {
      const res = await api.rescoreMentions(projectId);
      if (res.status === 'started') {
        toast.success(`Scoring ${res.count} leads with AI`, { description: 'This runs in the background. Results appear as they finish.' });
        // Refresh periodically while the background job works through the batch.
        let runs = 0;
        const interval = setInterval(async () => {
          runs += 1;
          try {
            const refreshed = await loadMentions();
            if (runs >= 15 || refreshed.every((m) => !isUnscored(m))) {
              clearInterval(interval);
              setRescoring(false);
            }
          } catch { /* keep trying until the cap */ }
        }, 20_000);
      } else if (res.status === 'already_running') {
        toast.info('Scoring is already running. Results appear as they finish.');
        setRescoring(false);
      } else {
        toast.info('All leads are already scored.');
        setRescoring(false);
      }
    } catch (error) {
      toast.error('Could not start scoring', { description: error instanceof Error ? error.message : undefined });
      setRescoring(false);
    }
  }, [projectId, rescoring, loadMentions]);

  // ---- Derived data (memoised — the old page recomputed all of this every keystroke, twice) ----
  const availableSubreddits = useMemo(
    () => Array.from(new Set(allMentions.map((m) => m.subreddit))).sort(),
    [allMentions]
  );
  const availableIntents = useMemo(
    () => Array.from(new Set(allMentions.map((m) => m.intent).filter(Boolean))) as string[],
    [allMentions]
  );

  const triageCounts = useMemo(() => {
    const replied = allMentions.filter((m) => publishedComments[m.id]).length;
    const unread = allMentions.filter((m) => !viewedPosts.has(m.id) && !publishedComments[m.id]).length;
    return { all: allMentions.length, unread, replied };
  }, [allMentions, viewedPosts, publishedComments]);

  const filteredAll = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return allMentions
      .filter((m) => {
        if (filters.tab === 'unread' && (viewedPosts.has(m.id) || publishedComments[m.id])) return false;
        if (filters.tab === 'replied' && !publishedComments[m.id]) return false;
        if (q && !m.title.toLowerCase().includes(q) && !m.content.toLowerCase().includes(q)) return false;
        if (filters.subreddit !== 'all' && m.subreddit !== filters.subreddit) return false;
        if (filters.intent !== 'all' && (m.intent || '') !== filters.intent) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'new') return b.created_utc - a.created_utc;
        if (filters.sort === 'comments') return b.num_comments - a.num_comments;
        if (filters.sort === 'upvotes') return b.score - a.score;
        // Best match: real scores first, placeholder/unscored sink to the bottom.
        const scoreOf = (m: Mention) => (isUnscored(m) ? -1 : m.relevance_score ?? -1);
        return scoreOf(b) - scoreOf(a);
      });
  }, [allMentions, filters, viewedPosts, publishedComments]);

  const displayMentions = filteredAll.slice(0, visibleCount);

  const stats = useMemo(() => {
    const dayAgo = Date.now() / 1000 - 86_400;
    return {
      total: allMentions.length,
      newLast24h: allMentions.filter((m) => m.created_utc > dayAgo).length,
      highIntent: allMentions.filter(isHighIntent).length,
      unscored: allMentions.filter(isUnscored).length,
    };
  }, [allMentions]);

  const remaining = filteredAll.length - displayMentions.length;
  const dot = <span aria-hidden="true" className="text-ink-300">·</span>;

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[1280px]">
        {/* Header: what this is, the numbers that matter, and the actions. */}
        <header className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink-400">{project ? project.name : ' '}</p>
            <h1 className="font-play text-[30px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
              Opportunities
            </h1>
            {allMentions.length > 0 && (
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-400">
                <span><span className="font-semibold tabular-nums text-ink-900">{stats.total}</span> leads</span>
                {dot}
                <span><span className="font-semibold tabular-nums text-[#047857]">{stats.highIntent}</span> high intent</span>
                {stats.newLast24h > 0 && (
                  <>
                    {dot}
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#b83200]">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#ff4500]" />
                      <span className="tabular-nums">{stats.newLast24h} new today</span>
                    </span>
                  </>
                )}
                {stats.unscored > 3 && (
                  <>
                    {dot}
                    <span className="tabular-nums">{stats.unscored} not scored yet</span>
                    <button
                      onClick={handleRescore}
                      disabled={rescoring}
                      className="inline-flex items-center gap-1 font-semibold text-ink-900 underline decoration-ink-300 underline-offset-2 transition-colors hover:decoration-ink-900 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40 rounded"
                    >
                      {rescoring && <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />}
                      {rescoring ? 'Scoring' : 'Score them'}
                    </button>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push(`/mentions/${projectId}/analytics`)}
              className={`${BTN_QUIET} hidden sm:inline-flex`}
            >
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
              Analytics
            </button>
            <button
              onClick={() => {
                exportMentionsToCSV(filteredAll, project ? project.name.replace(/\s+/g, '_').toLowerCase() : 'sneakyguy_leads');
                toast.success(`Exported ${filteredAll.length} leads`);
              }}
              disabled={filteredAll.length === 0}
              className={BTN_QUIET}
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Export
            </button>
            <button
              onClick={() => startScan()}
              disabled={scanStatus === 'scanning'}
              className={`${BTN_SECONDARY} ml-1`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${scanStatus === 'scanning' ? 'animate-spin text-[#ff4500]' : ''}`} aria-hidden="true" />
              {scanStatus === 'scanning' ? 'Scanning' : 'Scan now'}
            </button>
          </div>
        </header>

        {scanStatus === 'scanning' && <ScanBanner progress={scanProgress} message={scanMessage} />}

        {!isLoading && allMentions.length > 0 && (
          <div className="mb-4">
            <FilterBar
              filters={filters}
              onChange={updateFilters}
              subreddits={availableSubreddits}
              intents={availableIntents}
              counts={triageCounts}
            />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="border-t-2 border-[#1c1917]/[0.08]" aria-busy="true" aria-label="Loading leads">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse border-b border-black/[0.06] py-4">
                <div className="h-[15px] rounded bg-[#f0efed]" style={{ width: `${[72, 58, 66, 80, 54, 63][i]}%` }} />
                <div className="mt-2.5 h-[11px] w-1/2 rounded bg-[#f6f5f3]" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="py-20 text-center">
            <p className="text-[15px] font-semibold text-ink-900">Could not load this project</p>
            <p className="mt-1.5 text-[13px] text-ink-400">{loadError}</p>
            <button onClick={() => window.location.reload()} className={`${BTN_PRIMARY} mt-5`}>
              Try again
            </button>
          </div>
        ) : allMentions.length === 0 ? (
          <div className="max-w-[52ch] py-12">
            <h2 className="font-play text-[24px] font-bold tracking-[-0.02em] text-ink-900">
              {scanStatus === 'scanning' ? 'Your first scan is running' : 'No leads yet'}
            </h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-ink-600">
              {scanStatus === 'scanning'
                ? 'We are reading your subreddits for conversations that match your keywords. This usually takes a minute or two.'
                : 'Scan Reddit to find conversations that match your keywords.'}
            </p>
            {project && project.keywords.length > 0 && (
              <p className="mt-4 text-[13px] leading-[1.8] text-ink-400">
                Watching <span className="text-ink-600">{project.keywords.slice(0, 8).join(', ')}</span>
              </p>
            )}
            {scanStatus !== 'scanning' && (
              <button onClick={() => startScan()} className={`${BTN_PRIMARY} mt-6`}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Scan Reddit now
              </button>
            )}
          </div>
        ) : displayMentions.length === 0 ? (
          <div className="py-16">
            <p className="text-[14px] text-ink-600">No leads match your filters.</p>
            <button
              onClick={() => updateFilters({ ...DEFAULT_FILTERS })}
              className="mt-2 text-[13px] font-semibold text-[#b83200] underline decoration-[#ff4500]/40 underline-offset-2 hover:decoration-[#b83200]"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {/* Desktop: two-pane inbox. Phones: the single-column list. */}
            <div className="hidden lg:block">
              <LeadInbox
                mentions={displayMentions}
                viewed={viewedPosts}
                published={publishedComments}
                dmSent={dmSent}
                onViewed={markViewed}
                onPublished={markPublished}
                onDmSent={markDmSent}
                remaining={remaining}
                onLoadMore={() => setVisibleCount((c) => c + MENTIONS_PER_PAGE)}
                initialSelectedId={initialSelectedId}
              />
            </div>
            <div className="-ml-4 border-t border-black/[0.06] lg:hidden">
              {displayMentions.map((mention) => (
                <MentionCard
                  key={mention.id}
                  mention={mention}
                  viewed={viewedPosts.has(mention.id)}
                  publishedUrl={publishedComments[mention.id]}
                  onViewed={markViewed}
                  onPublished={markPublished}
                />
              ))}
            </div>

            {remaining > 0 && (
              <div className="mb-6 mt-6 lg:hidden">
                <button
                  onClick={() => setVisibleCount((c) => c + MENTIONS_PER_PAGE)}
                  className="h-10 w-full rounded-xl border-2 border-dashed border-ink-300 text-[13px] font-semibold text-ink-600 transition-colors hover:border-[#1c1917] hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                >
                  Show {Math.min(MENTIONS_PER_PAGE, remaining)} more
                  <span className="font-normal text-ink-400"> ({remaining} left)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </PaymentGuard>
  );
}
