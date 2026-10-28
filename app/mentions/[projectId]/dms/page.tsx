'use client';

// DM queue: strong leads (80+) from people we can message, best first. One
// job: draft a message, open it on Reddit, press Sent.

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Check, Inbox } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentGuard } from '@/components/PaymentGuard';
import { LeadInbox } from '@/components/mentions/LeadInbox';
import { MentionCard } from '@/components/mentions/MentionCard';
import { QueueError, QueueHeader, QueueSkeleton } from '@/components/mentions/QueueHeader';
import { useProjectLeads } from '@/lib/useProjectLeads';
import { useTriage } from '@/lib/useTriage';
import { byBestScore, inDmQueue } from '@/lib/mentions';
import { BTN_SECONDARY } from '@/components/ui/sticker';

export default function DmQueuePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params?.projectId as string;
  const { project, mentions, isLoading, error } = useProjectLeads(projectId);
  const triage = useTriage(projectId);

  const queue = useMemo(
    () => mentions.filter((m) => inDmQueue(m, triage.dmSent)).sort(byBestScore),
    [mentions, triage.dmSent]
  );
  const leadParam = searchParams?.get('lead');
  const initialSelectedId = leadParam ? parseInt(leadParam, 10) : null;

  const sent = (id: number) => {
    triage.markDmSent(id);
    toast.success('Sent. On to the next one');
  };

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[1280px]">
        <QueueHeader
          projectName={project?.name}
          title="DM queue"
          lede={
            queue.length > 0
              ? <><span className="font-semibold tabular-nums text-ink-900">{queue.length}</span> {queue.length === 1 ? 'person' : 'people'} worth a direct message. Draft one, send it on Reddit, then press Sent.</>
              : 'Leads scoring 80 or more with a known poster land here.'
          }
        />

        {isLoading ? (
          <QueueSkeleton label="Loading the DM queue" />
        ) : error ? (
          <QueueError message={error} />
        ) : queue.length === 0 ? (
          <div className="max-w-[52ch] py-12">
            <h2 className="font-play text-[24px] font-bold tracking-[-0.02em] text-ink-900">Queue is clear</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-ink-600">
              When a scan finds a lead scoring 80 or more from a poster we can name, it shows up here with a one-click message draft.
            </p>
            <Link href={`/mentions/${projectId}`} className={`${BTN_SECONDARY} mt-6`}>
              <Inbox className="h-4 w-4" aria-hidden="true" />
              Go to Opportunities
            </Link>
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <LeadInbox
                mentions={queue}
                cardFocus="dm"
                viewed={triage.viewed}
                published={triage.published}
                dmSent={triage.dmSent}
                onViewed={triage.markViewed}
                onPublished={triage.markPublished}
                onDmSent={triage.markDmSent}
                remaining={0}
                onLoadMore={() => {}}
                initialSelectedId={initialSelectedId}
                footer={(m, pos) => (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] tabular-nums text-ink-400">
                      {pos.index + 1} of {pos.total}
                    </span>
                    <button onClick={() => sent(m.id)} className={BTN_SECONDARY}>
                      <Check className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                      Sent
                    </button>
                  </div>
                )}
              />
            </div>
            <div className="lg:hidden">
              <ul className="space-y-3" aria-label="People to message">
                {queue.map((m) => (
                  <li key={m.id} className="rounded-2xl border-2 border-[#1c1917] bg-white p-4 shadow-[3px_3px_0_#1c1917]">
                    <MentionCard
                      variant="detail"
                      focus="dm"
                      mention={m}
                      viewed={triage.viewed.has(m.id)}
                      publishedUrl={triage.published[m.id]}
                      dmSentAt={triage.dmSent[m.id]}
                      onViewed={triage.markViewed}
                      onPublished={triage.markPublished}
                      onDmSent={sent}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </PaymentGuard>
  );
}
