'use client';

// Overview: the five numbers that matter and the three leads to answer now.
// Every card is a link into its queue.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, MessageSquare, Radio, Send, Inbox, Check, type LucideIcon } from 'lucide-react';
import { PaymentGuard } from '@/components/PaymentGuard';
import { QueueError, QueueHeader } from '@/components/mentions/QueueHeader';
import { useProjectLeads } from '@/lib/useProjectLeads';
import { useTriage } from '@/lib/useTriage';
import { api } from '@/lib/api';
import { byBestScore, inDmQueue, inReplyQueue, isUnscored, relativeTime } from '@/lib/mentions';
import { PANEL, STICKER_PANEL } from '@/components/ui/sticker';

function StatCard({
  href, label, value, icon: Icon, tone = 'ink', hint,
}: {
  href: string;
  label: string;
  value: number | null;
  icon: LucideIcon;
  tone?: 'ink' | 'orange' | 'green';
  hint?: string;
}) {
  const valueTone = tone === 'green' ? 'text-[#047857]' : tone === 'orange' ? 'text-[#b83200]' : 'text-ink-900';
  return (
    <Link
      href={href}
      className={`${PANEL} group block p-4 transition-[border-color,box-shadow,transform] duration-150 motion-reduce:transition-none hover:-translate-x-px hover:-translate-y-px hover:border-[#1c1917] hover:shadow-[3px_3px_0_#1c1917] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2`}
    >
      <div className="flex items-center justify-between text-ink-400">
        <span className="text-[12.5px] font-semibold">{label}</span>
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className={`mt-2 font-play text-[30px] font-extrabold leading-none tabular-nums tracking-[-0.02em] ${valueTone}`} aria-busy={value === null}>
        {value === null ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-[#f0efed] motion-reduce:animate-none" /> : value}
      </p>
      <p className="mt-2 flex items-center gap-1 text-[12px] text-ink-400 group-hover:text-ink-900">
        {hint ?? 'Open'}
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      </p>
    </Link>
  );
}

export default function OverviewPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const { project, mentions, isLoading, error } = useProjectLeads(projectId);
  const triage = useTriage(projectId);
  const [signalCount, setSignalCount] = useState<number | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    api.getSignals(projectId)
      .then((s) => { if (!cancelled) setSignalCount(s.items.length); })
      .catch(() => { if (!cancelled) setSignalCount(0); });
    return () => { cancelled = true; };
  }, [projectId]);

  const stats = useMemo(() => {
    if (isLoading) return null;
    const dayAgo = Date.now() / 1000 - 86_400;
    return {
      newLeads: mentions.filter((m) => m.created_utc > dayAgo).length,
      repliesReady: mentions.filter((m) => inReplyQueue(m, triage.published)).length,
      dmsToSend: mentions.filter((m) => inDmQueue(m, triage.dmSent)).length,
      replied: mentions.filter((m) => !!triage.published[m.id]).length,
    };
  }, [mentions, triage.published, triage.dmSent, isLoading]);

  const top3 = useMemo(
    () => mentions.filter((m) => !triage.published[m.id] && !isUnscored(m)).sort(byBestScore).slice(0, 3),
    [mentions, triage.published]
  );

  const base = `/mentions/${projectId}`;

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[1080px]">
        <QueueHeader
          projectName={project?.name}
          title="Overview"
          lede={project && project.keywords.length > 0 ? <>Watching {project.keywords.slice(0, 6).join(', ')}{project.keywords.length > 6 ? ` and ${project.keywords.length - 6} more` : ''}.</> : undefined}
        />

        {error ? (
          <QueueError message={error} />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <StatCard href={`${base}?sort=new`} label="New leads, 24h" value={stats ? stats.newLeads : null} icon={Inbox} tone="orange" hint="Opportunities" />
              <StatCard href={`${base}/replies`} label="Replies ready" value={stats ? stats.repliesReady : null} icon={MessageSquare} hint="Reply queue" />
              <StatCard href={`${base}/dms`} label="DMs to send" value={stats ? stats.dmsToSend : null} icon={Send} hint="DM queue" />
              <StatCard href={`${base}?tab=replied`} label="Replied" value={stats ? stats.replied : null} icon={Check} tone="green" hint="See them" />
              <StatCard href={`${base}/signals`} label="Brand signals" value={signalCount} icon={Radio} hint="Brand signals" />
            </div>

            <section className={`${STICKER_PANEL} mt-6 p-5 sm:p-6`}>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-play text-[20px] font-bold tracking-[-0.02em] text-ink-900">Top 3 to answer now</h2>
                <Link href={base} className="rounded text-[13px] font-semibold text-ink-600 underline decoration-ink-300 underline-offset-2 hover:text-ink-900 hover:decoration-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40">
                  All opportunities
                </Link>
              </div>
              {isLoading ? (
                <ul className="mt-3 space-y-2" aria-busy="true" aria-label="Loading leads">
                  {[0, 1, 2].map((i) => <li key={i} className="h-14 animate-pulse rounded-xl bg-[#f6f5f3] motion-reduce:animate-none" />)}
                </ul>
              ) : top3.length === 0 ? (
                <p className="mt-3 text-[14px] text-ink-600">Nothing waiting. The next scan will bring new leads here.</p>
              ) : (
                <ol className="mt-3 divide-y divide-black/[0.06]">
                  {top3.map((m) => {
                    const href = m.draft_reply ? `${base}/replies?lead=${m.id}` : `${base}?lead=${m.id}`;
                    return (
                      <li key={m.id}>
                        <Link
                          href={href}
                          className="group flex items-start gap-3 rounded-lg py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1c1917] font-play text-[16px] font-extrabold tabular-nums ${(m.relevance_score ?? 0) >= 80 ? 'bg-[#059669] text-white' : 'bg-[#1c1917] text-white'}`}
                            aria-label={`Score ${m.relevance_score} out of 100`}
                          >
                            {m.relevance_score}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14.5px] font-semibold leading-snug text-ink-900 line-clamp-2 group-hover:underline">{m.title}</span>
                            <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[12px] text-ink-400">
                              <span className="font-medium text-ink-600">r/{m.subreddit}</span>
                              <span aria-hidden="true">·</span>
                              <span>{relativeTime(m.created_utc)}</span>
                              {m.draft_reply && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-semibold text-[#b83200]">Reply ready</span>
                                </>
                              )}
                            </span>
                          </span>
                          <ArrowRight className="mt-2.5 h-4 w-4 shrink-0 text-ink-300 group-hover:text-ink-900" aria-hidden="true" />
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>
          </>
        )}
      </div>
    </PaymentGuard>
  );
}
