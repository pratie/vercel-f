'use client';

// SEO opportunities: Reddit threads Google shows for this project's keywords.
// One job per row: get a helpful reply into that thread, because everyone who
// searches the keyword keeps reading it for as long as it ranks.

import { useCallback, useEffect, useState, type ReactNode, Fragment } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowUpRight, Check, Lock, MessageCircle, RefreshCw, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentGuard } from '@/components/PaymentGuard';
import { QueueError, QueueHeader, QueueSkeleton } from '@/components/mentions/QueueHeader';
import { useAuth } from '@/components/AuthContext';
import { api, Project, SeoOpportunitiesResponse, SeoOpportunity } from '@/lib/api';
import { relativeTime } from '@/lib/mentions';
import { BTN_PRIMARY, BTN_QUIET, BTN_SECONDARY, STICKER_PANEL } from '@/components/ui/sticker';

/** "2h 40m" until an ISO time, or null once it has passed. */
function timeUntil(iso: string | null, now: number): string | null {
  if (!iso) return null;
  const ms = new Date(iso.endsWith('Z') ? iso : `${iso}Z`).getTime() - now;
  if (ms <= 0) return null;
  const mins = Math.max(1, Math.ceil(ms / 60_000));
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
}

/** Server times are naive UTC. */
function utcSeconds(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor(new Date(iso.endsWith('Z') ? iso : `${iso}Z`).getTime() / 1000);
}

export default function SeoOpportunitiesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [data, setData] = useState<SeoOpportunitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // The cooldown label counts down without a reload.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!projectId || isNaN(parseInt(projectId, 10))) {
      toast.error('Invalid project');
      router.push('/projects');
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const [projectData, fresh] = await Promise.all([
          api.getProject(projectId),
          api.getSeoOpportunities(projectId),
        ]);
        if (cancelled) return;
        setProject(projectData);
        setData(fresh);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load SEO opportunities.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  const refresh = useCallback(async () => {
    if (!projectId || refreshing) return;
    setRefreshing(true);
    try {
      const res = await api.refreshSeoOpportunities(projectId);
      const fresh = await api.getSeoOpportunities(projectId);
      setData(fresh);
      setNow(Date.now());
      toast.success(
        res.found > 0
          ? `Found ${res.found} Reddit ${res.found === 1 ? 'thread' : 'threads'} on Google`
          : 'No Reddit threads on Google for these keywords yet'
      );
    } catch (e) {
      toast.error('Could not refresh', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setRefreshing(false);
    }
  }, [projectId, refreshing]);

  const onImported = useCallback((id: number, leadId: number) => {
    setData((prev) => prev && {
      ...prev,
      opportunities: prev.opportunities.map((o) => (o.id === id ? { ...o, lead: { id: leadId, draft_reply: null } } : o)),
    });
  }, []);

  const cooldown = timeUntil(data?.next_refresh_at ?? null, now);
  const checkedAt = utcSeconds(data?.last_refreshed_at ?? null);
  const canRefresh = !!data?.configured && data.keywords_total > 0 && !cooldown && !refreshing;

  const refreshButton = data && (
    <button
      type="button"
      onClick={refresh}
      disabled={!canRefresh}
      className={data.opportunities.length ? BTN_SECONDARY : BTN_PRIMARY}
      title={cooldown ? `You can refresh again in ${cooldown}` : undefined}
    >
      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
      {refreshing ? 'Checking Google' : cooldown ? `Refresh in ${cooldown}` : 'Refresh'}
    </button>
  );

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[1080px]">
        <QueueHeader
          projectName={project?.name}
          title="SEO opportunities"
          lede="Reddit threads that show up on Google for your keywords. A good reply here keeps getting read for years."
        >
          {data && data.opportunities.length > 0 && refreshButton}
        </QueueHeader>

        {isLoading ? (
          <QueueSkeleton label="Loading SEO opportunities" />
        ) : error ? (
          <QueueError message={error} />
        ) : data!.opportunities.length === 0 ? (
          <EmptyState
            data={data!}
            projectId={projectId}
            refreshing={refreshing}
            cooldown={cooldown}
            button={refreshButton}
          />
        ) : (
          <>
            <p className="text-[13px] text-ink-600" role="status" aria-live="polite">
              {refreshing
                ? `Searching Google for ${data!.keywords_checked} ${data!.keywords_checked === 1 ? 'keyword' : 'keywords'}. This takes about 20 seconds.`
                : <>
                    {data!.opportunities.length} {data!.opportunities.length === 1 ? 'thread' : 'threads'} from {data!.keywords_checked} of {data!.keywords_total} {data!.keywords_total === 1 ? 'keyword' : 'keywords'}
                    {checkedAt ? `, checked ${relativeTime(checkedAt)}` : ''}. Google is re-checked every week.
                  </>}
            </p>
            <ol className="mt-4 border-t-2 border-[#1c1917]/[0.08]">
              {data!.opportunities.map((o, i, all) => {
                // The API lists open threads first; mark where the archived ones begin.
                const closed = o.archived || o.locked;
                const firstClosed = closed && (i === 0 || !(all[i - 1].archived || all[i - 1].locked));
                return (
                  <Fragment key={o.id}>
                    {firstClosed && (
                      <li className="pb-2 pt-6 text-[13px] text-ink-400">
                        Still ranking, but Reddit closed these to new comments. Worth reading for what people ask.
                      </li>
                    )}
                    <OpportunityRow opp={o} projectId={projectId} onImported={onImported} />
                  </Fragment>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </PaymentGuard>
  );
}

/* ── Empty state ───────────────────────────────────────────────────────── */

function EmptyState({
  data, projectId, refreshing, cooldown, button,
}: {
  data: SeoOpportunitiesResponse;
  projectId: string;
  refreshing: boolean;
  cooldown: string | null;
  button: ReactNode;
}) {
  let heading = 'Find the threads Google already ranks';
  let body = `Press Refresh and we search Google for your ${data.keywords_checked} ${data.keywords_checked === 1 ? 'keyword' : 'keywords'} and keep every Reddit thread on the first two pages. It takes about 20 seconds.`;
  if (!data.configured) {
    heading = 'Google search is not switched on yet';
    body = 'This needs a setting on our side. Check back soon.';
  } else if (data.keywords_total === 0) {
    heading = 'Add keywords first';
    body = 'SEO opportunities come from your keywords. Add a few to this project, then come back and press Refresh.';
  } else if (data.last_refreshed_at) {
    heading = 'No Reddit threads on Google yet';
    body = cooldown
      ? `Google showed no Reddit threads for your keywords. Try broader keywords, or refresh again in ${cooldown}.`
      : 'Google showed no Reddit threads for your keywords. Try broader keywords and refresh again.';
  }

  return (
    <div className={`${STICKER_PANEL} max-w-[640px] p-6 sm:p-8`}>
      <h2 className="font-play text-[24px] font-bold tracking-[-0.02em] text-ink-900">{heading}</h2>
      <p className="mt-2 text-[14px] leading-[1.7] text-ink-600">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {data.configured && data.keywords_total > 0 && button}
        {data.configured && data.keywords_total === 0 && (
          <Link href={`/mentions/${projectId}/overview`} className={BTN_PRIMARY}>Go to the project</Link>
        )}
      </div>
      {refreshing && (
        <p className="mt-4 text-[13px] text-ink-600" role="status" aria-live="polite">
          Searching Google. This page fills in on its own.
        </p>
      )}
    </div>
  );
}

/* ── Row ───────────────────────────────────────────────────────────────── */

function OpportunityRow({
  opp, projectId, onImported,
}: {
  opp: SeoOpportunity;
  projectId: string;
  onImported: (id: number, leadId: number) => void;
}) {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const closed = opp.archived || opp.locked;
  const lead = opp.lead;

  const draft = async () => {
    if (importing) return;
    setImporting(true);
    try {
      const res = await api.importSeoThread(projectId, opp.url);
      onImported(opp.id, res.lead_id);
      router.push(`/mentions/${projectId}?lead=${res.lead_id}`);
    } catch (e) {
      toast.error('Could not open this thread', { description: e instanceof Error ? e.message : undefined });
      setImporting(false);
    }
  };

  return (
    <li className={`border-b border-black/[0.08] py-4 ${closed ? 'opacity-70' : ''}`}>
      <div className="flex gap-3 sm:gap-4">
        <span
          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border-2 border-[#1c1917] bg-white font-play leading-none text-ink-900"
          title={opp.google_position ? `Position ${opp.google_position} on Google for "${opp.keyword} reddit"` : 'Position unknown'}
        >
          <span className="text-[16px] font-extrabold tabular-nums">#{opp.google_position ?? '?'}</span>
          <span className="mt-0.5 text-[9.5px] font-semibold text-ink-400">Google</span>
        </span>

        <div className="min-w-0 flex-1 sm:flex sm:items-start sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-play text-[16.5px] font-bold leading-[1.3] tracking-[-0.01em] text-ink-900">
              <a href={opp.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {opp.title}
              </a>
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px] text-ink-600">
              <span className="font-semibold text-ink-900">r/{opp.subreddit}</span>
              <span aria-hidden="true">·</span>
              <span>ranks for <span className="text-ink-900">{opp.keyword}</span></span>
              {opp.num_comments != null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <MessageCircle className="h-3 w-3" aria-hidden="true" />
                    {opp.num_comments} {opp.num_comments === 1 ? 'comment' : 'comments'}
                  </span>
                </>
              )}
              {opp.created_utc && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>posted {relativeTime(opp.created_utc)}</span>
                </>
              )}
            </p>
            {closed && (
              <p className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-medium text-ink-600">
                <Lock className="h-3 w-3" aria-hidden="true" />
                {opp.locked ? 'Locked by the moderators' : 'Archived'}, so it no longer takes new comments
              </p>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1 sm:mt-0 sm:shrink-0">
            {lead ? (
              <Link
                href={lead.draft_reply ? `/mentions/${projectId}/replies?lead=${lead.id}` : `/mentions/${projectId}?lead=${lead.id}`}
                className={`${BTN_QUIET} font-semibold text-[#047857] hover:text-[#047857]`}
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                In your leads
              </Link>
            ) : !closed ? (
              <button type="button" onClick={draft} disabled={importing} className={BTN_SECONDARY}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {importing ? 'Opening' : 'Draft a reply'}
              </button>
            ) : null}
            <a href={opp.url} target="_blank" rel="noopener noreferrer" className={BTN_QUIET} aria-label={`Open "${opp.title}" on Reddit`}>
              Reddit
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}
