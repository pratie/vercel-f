'use client';

// Brand signals: Reddit posts that name the product or one of its
// competitors. Two groups, newest first, with a tag when the title is asking
// for an alternative.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { PaymentGuard } from '@/components/PaymentGuard';
import { QueueError, QueueHeader, QueueSkeleton } from '@/components/mentions/QueueHeader';
import { api, BrandSignal, BrandSignalsResponse, Project } from '@/lib/api';
import { relativeTime } from '@/lib/mentions';
import { BTN_QUIET } from '@/components/ui/sticker';

function SignalRow({ s }: { s: BrandSignal }) {
  const competitor = s.label.startsWith('mentions_competitor:') ? s.label.slice('mentions_competitor:'.length) : null;
  const altTarget = competitor ?? s.competitors[0] ?? null;
  return (
    <li className="border-b border-black/[0.06] py-3.5">
      <a
        href={s.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/30"
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {s.alternative_ask && (
            <span className="inline-flex items-center rounded-md border-2 border-[#1c1917] bg-white px-1.5 py-0.5 text-[11.5px] font-semibold text-ink-900">
              {altTarget ? `Alternative to ${altTarget}?` : 'Looking for an alternative'}
            </span>
          )}
          {s.competitors.length > 1 && (
            <span className="text-[11.5px] font-medium text-ink-400">also names {s.competitors.slice(1).join(', ')}</span>
          )}
        </span>
        <span
          className={`block text-[15px] font-semibold leading-[1.45] tracking-[-0.011em] text-ink-900 group-hover:underline ${s.alternative_ask || s.competitors.length > 1 ? 'mt-1' : ''}`}
          style={{ textWrap: 'pretty' } as React.CSSProperties}
        >
          {s.title}
        </span>
        {s.content && <span className="mt-1 block text-[13px] leading-relaxed text-ink-400 line-clamp-1">{s.content}</span>}
        <span className="mt-1.5 flex flex-wrap items-center gap-x-2 text-[12px] tabular-nums text-ink-400">
          <span className="font-medium text-ink-600">r/{s.subreddit}</span>
          <span aria-hidden="true" className="text-ink-300">·</span>
          <span>{relativeTime(s.created_utc)}</span>
          <span aria-hidden="true" className="text-ink-300">·</span>
          <span>{s.num_comments} comments</span>
          {s.author && s.author !== 'unknown' && (
            <>
              <span aria-hidden="true" className="text-ink-300">·</span>
              <span>u/{s.author}</span>
            </>
          )}
          <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none" aria-hidden="true" />
        </span>
      </a>
    </li>
  );
}

export default function BrandSignalsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [data, setData] = useState<BrandSignalsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!projectId) return;
    let cancelled = false;
    Promise.all([api.getProject(projectId), api.getSignals(projectId)])
      .then(([p, s]) => { if (!cancelled) { setProject(p); setData(s); } })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load brand signals.'); });
    return () => { cancelled = true; };
  }, [projectId, user, router]);

  const groups = useMemo(() => {
    const items = data?.items ?? [];
    return {
      you: items.filter((s) => s.label === 'mentions_you'),
      competitor: items.filter((s) => s.label !== 'mentions_you'),
    };
  }, [data]);

  const isLoading = !data && !error;

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[880px]">
        <QueueHeader
          projectName={project?.name}
          title="Brand signals"
          lede={
            data
              ? data.competitors.length > 0
                ? <>Posts that name <span className="font-semibold text-ink-900">{data.brand}</span> or {data.competitors.join(', ')}.</>
                : <>Posts that name <span className="font-semibold text-ink-900">{data.brand}</span>. Add competitors under AI visibility to watch them too.</>
              : 'Posts that name your product or a competitor.'
          }
        >
          <Link href={`/visibility/${projectId}`} className={BTN_QUIET}>
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Competitors
          </Link>
        </QueueHeader>

        {isLoading ? (
          <QueueSkeleton label="Loading brand signals" />
        ) : error ? (
          <QueueError message={error} />
        ) : groups.you.length + groups.competitor.length === 0 ? (
          <div className="max-w-[52ch] py-12">
            <h2 className="font-play text-[24px] font-bold tracking-[-0.02em] text-ink-900">Nothing yet</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-ink-600">
              Every scan now watches for your product name{data && data.competitors.length > 0 ? ' and your competitors' : ''}. Posts that name them will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="font-play text-[18px] font-bold tracking-[-0.02em] text-ink-900">
                Mentions you <span className="ml-1 text-[14px] font-semibold tabular-nums text-ink-400">{groups.you.length}</span>
              </h2>
              {groups.you.length === 0 ? (
                <p className="mt-2 text-[13.5px] text-ink-400">No one has named {data?.brand} yet.</p>
              ) : (
                <ul className="mt-1 border-t border-black/[0.06]">{groups.you.map((s) => <SignalRow key={s.id} s={s} />)}</ul>
              )}
            </section>
            <section>
              <h2 className="font-play text-[18px] font-bold tracking-[-0.02em] text-ink-900">
                Mentions a competitor <span className="ml-1 text-[14px] font-semibold tabular-nums text-ink-400">{groups.competitor.length}</span>
              </h2>
              {groups.competitor.length === 0 ? (
                <p className="mt-2 text-[13.5px] text-ink-400">
                  {data && data.competitors.length > 0 ? 'No competitor mentions yet.' : 'Add competitors to watch for people asking about them.'}
                </p>
              ) : (
                <ul className="mt-1 border-t border-black/[0.06]">{groups.competitor.map((s) => <SignalRow key={s.id} s={s} />)}</ul>
              )}
            </section>
          </div>
        )}
      </div>
    </PaymentGuard>
  );
}
