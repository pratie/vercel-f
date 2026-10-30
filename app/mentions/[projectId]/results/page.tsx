'use client';

// Results: every reply the user posted and how it is doing on Reddit. The
// server rechecks each comment hourly for two days, then daily for a month.

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowUpRight, Info, MessageCircle, MessageSquare, Search } from 'lucide-react';
import { PaymentGuard } from '@/components/PaymentGuard';
import { QueueError, QueueHeader, QueueSkeleton } from '@/components/mentions/QueueHeader';
import { cleanRedditText } from '@/components/mentions/MentionCard';
import { CommentLinkPrompt } from '@/components/results/CommentLinkPrompt';
import { ReplyStatusPill } from '@/components/results/ReplyStatusPill';
import { api, Project, ReplyResult, ResultsResponse } from '@/lib/api';
import { relativeTime } from '@/lib/mentions';
import { useTriage } from '@/lib/useTriage';
import { BTN_PRIMARY, BTN_QUIET, PANEL, STICKER_PANEL } from '@/components/ui/sticker';

const POLL_MS = 15_000;
const MAX_POLLS = 6;

function secs(iso: string | null): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? null : Math.floor(t / 1000);
}

function Stat({ label, value, sub, tone = 'ink' }: { label: string; value: string | number | null; sub?: string; tone?: 'ink' | 'green' }) {
  return (
    <div className={`${PANEL} p-4`}>
      <p className="text-[12.5px] font-semibold text-ink-400">{label}</p>
      <p
        className={`mt-2 font-play text-[30px] font-extrabold leading-none tabular-nums tracking-[-0.02em] ${tone === 'green' ? 'text-[#047857]' : 'text-ink-900'}`}
        aria-busy={value === null}
      >
        {value === null ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-[#f0efed] motion-reduce:animate-none" /> : value}
      </p>
      {sub && <p className="mt-1.5 text-[12px] text-ink-400">{sub}</p>}
    </div>
  );
}

/** Upvotes over time, when there are at least two checks. */
function Trend({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 64, h = 20;
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${((i / (points.length - 1)) * w).toFixed(1)},${(h - 2 - ((p - min) / span) * (h - 4)).toFixed(1)}`)
    .join(' ');
  const up = points[points.length - 1] >= points[0];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" role="img" aria-label={`Upvotes over time: ${points[0]} to ${points[points.length - 1]}`}>
      <path d={d} fill="none" stroke={up ? '#059669' : '#a8a29e'} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: 'green' | 'ink' }) {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-full border-2 px-2 text-[12px] font-semibold ${
        tone === 'green' ? 'border-[#1c1917] bg-[#059669] text-white' : 'border-[#1c1917]/[0.15] bg-white text-ink-900'
      }`}
    >
      {children}
    </span>
  );
}

function ResultRow({ item, onSaveLink }: { item: ReplyResult; onSaveLink: (id: number, url: string) => Promise<void> }) {
  const [adding, setAdding] = useState(false);
  const posted = secs(item.replied_at);
  const checked = secs(item.last_checked_at);
  const live = item.status === 'live';
  const known = item.status === 'live' || item.status === 'removed' || item.status === 'deleted';
  const trend = item.history.filter((h) => h.status === 'live' && h.score != null).map((h) => h.score as number);

  let note: string | null = null;
  if (item.status === 'unlinked') {
    note = item.next_check_at
      ? 'No comment link yet. We are looking for your reply in the thread, or paste the link.'
      : 'No comment link, so we cannot track this one. Paste the link to start.';
  } else if (item.status === 'checking') {
    note = 'Reading your comment on Reddit. This takes a minute.';
  } else if (checked) {
    note = `Checked ${relativeTime(checked)}${item.next_check_at ? '' : '. Tracking ended after 30 days'}`;
  }

  return (
    <li className="border-b border-black/[0.08] bg-white py-4">
      <div className="flex gap-3 sm:gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border-2 bg-white font-play leading-none ${
            live ? 'border-[#1c1917] text-ink-900' : 'border-[#1c1917]/[0.15] text-ink-400'
          }`}
          title={item.score != null ? `${item.score} upvotes` : 'Upvotes not known yet'}
        >
          <span className="text-[16px] font-extrabold tabular-nums">{known && item.score != null ? item.score : '?'}</span>
          <span className="mt-0.5 text-[9.5px] font-semibold text-ink-400">upvotes</span>
        </span>

        <div className="min-w-0 flex-1 sm:flex sm:items-start sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-play text-[16.5px] font-bold leading-[1.3] tracking-[-0.01em] text-ink-900">
              <a
                href={item.thread_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
              >
                {cleanRedditText(item.title) || 'Reddit thread'}
              </a>
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12.5px] text-ink-600">
              <span className="font-semibold text-ink-900">r/{item.subreddit}</span>
              {posted && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>posted {relativeTime(posted)}</span>
                </>
              )}
              {known && item.num_replies != null && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <MessageCircle className="h-3 w-3" aria-hidden="true" />
                    {item.num_replies} {item.num_replies === 1 ? 'reply' : 'replies'}
                  </span>
                </>
              )}
            </p>

            {(live && item.rank != null) || item.google_position != null ? (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {live && item.rank === 1 && <Badge tone="green">Top comment</Badge>}
                {live && item.rank != null && item.rank > 1 && <Badge tone="ink">#{item.rank} in thread</Badge>}
                {item.google_position != null && <Badge tone="ink">Ranks #{item.google_position} on Google</Badge>}
              </div>
            ) : null}

            {item.hint && (
              <p className={`mt-2 flex max-w-[64ch] gap-1.5 text-[13px] leading-[1.6] ${item.status === 'removed' ? 'text-rose-800' : 'text-ink-600'}`}>
                <Info className="mt-[3px] h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{item.hint}</span>
              </p>
            )}
            {note && <p className="mt-1.5 text-[12px] text-ink-400">{note}</p>}

            {adding && (
              <div className="mt-3 max-w-[560px]">
                <CommentLinkPrompt
                  compact
                  onSave={async (url) => { await onSaveLink(item.mention_id, url); setAdding(false); }}
                  onCancel={() => setAdding(false)}
                />
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1 sm:mt-0 sm:shrink-0">
            <Trend points={trend} />
            <ReplyStatusPill status={item.status} className="ml-1" />
            {item.comment_url ? (
              <a href={item.comment_url} target="_blank" rel="noopener noreferrer" className={BTN_QUIET}>
                Your comment
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : !adding && (
              <button type="button" onClick={() => setAdding(true)} className={`${BTN_QUIET} font-semibold text-ink-900`}>
                Add comment link
              </button>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const triage = useTriage(projectId);
  const [project, setProject] = useState<Project | null>(null);
  const [data, setData] = useState<ResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const polls = useRef(0);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await api.getResults(projectId);
      setData(res);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your results.');
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;
    api.getProject(projectId).then(setProject).catch(() => { /* the header just shows no name */ });
  }, [projectId]);

  // Refetch after every triage sync: the first one may have uploaded replies
  // this browser knew about and the server did not.
  useEffect(() => { load(); }, [load, triage.version]);

  // A freshly pasted link is checked within a minute. Poll a few times for it.
  const checking = !!data?.items.some((i) => i.status === 'checking');
  useEffect(() => {
    if (!checking) { polls.current = 0; return; }
    if (polls.current >= MAX_POLLS) return;
    const t = window.setTimeout(() => { polls.current += 1; load(); }, POLL_MS);
    return () => window.clearTimeout(t);
  }, [checking, data, load]);

  const saveLink = async (id: number, url: string) => {
    await triage.saveCommentLink(id, url);
    await load();
  };

  const s = data?.stats;
  const base = `/mentions/${projectId}`;

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[1080px]">
        <QueueHeader
          projectName={project?.name}
          title="Results"
          lede="Every reply you posted and how it is doing on Reddit. We check each one hourly for two days, then daily for a month."
        />

        {error && !data ? (
          <QueueError message={error} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Replies posted" value={s ? s.replies_posted : null} />
              <Stat
                label="Still live"
                value={s ? (s.live_pct == null ? '-' : `${s.live_pct}%`) : null}
                sub={s && s.tracked > 0 ? `${s.live} of ${s.tracked} checked` : s ? 'Nothing checked yet' : undefined}
                tone="green"
              />
              <Stat label="Total upvotes" value={s ? s.total_upvotes : null} sub={s ? 'On live comments' : undefined} />
              <Stat label="Top comments" value={s ? s.top_comments : null} sub={s ? 'First in their thread' : undefined} />
            </div>

            <div className="mt-6">
              {!data ? (
                <QueueSkeleton label="Loading your results" />
              ) : data.items.length === 0 ? (
                <div className={`${STICKER_PANEL} max-w-[640px] p-6 sm:p-8`}>
                  <h2 className="font-play text-[24px] font-bold tracking-[-0.02em] text-ink-900">No replies posted yet</h2>
                  <p className="mt-2 text-[14px] leading-[1.7] text-ink-600">
                    Open a lead, press Copy and open Reddit, and post the reply from your account. When you come back,
                    paste the link to your comment. It shows up here with its upvotes, replies, where it ranks in the
                    thread and whether moderators kept it up.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <Link href={`${base}/replies`} className={BTN_PRIMARY}>
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      Go to the reply queue
                    </Link>
                    <Link href={`${base}/seo`} className={BTN_QUIET}>
                      <Search className="h-4 w-4" aria-hidden="true" />
                      Find threads that rank on Google
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <p className="mb-3 text-[13px] text-rose-700" role="alert">
                      Could not refresh: {error}
                    </p>
                  )}
                  <ol className="border-t border-black/[0.08]" aria-label="Your replies">
                    {data.items.map((item) => (
                      <ResultRow key={item.mention_id} item={item} onSaveLink={saveLink} />
                    ))}
                  </ol>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </PaymentGuard>
  );
}
