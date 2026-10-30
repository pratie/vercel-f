'use client';

// Reply queue: every lead with a drafted reply that has not been posted yet,
// best score first. One job: copy the draft, post it on Reddit, press Posted.

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
import { byBestScore, inReplyQueue } from '@/lib/mentions';
import { BTN_SECONDARY } from '@/components/ui/sticker';

export default function ReplyQueuePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params?.projectId as string;
  const { project, mentions, isLoading, error } = useProjectLeads(projectId);
  const triage = useTriage(projectId);

  const queue = useMemo(
    () => mentions.filter((m) => inReplyQueue(m, triage.published)).sort(byBestScore),
    [mentions, triage.published]
  );
  const leadParam = searchParams?.get('lead');
  const initialSelectedId = leadParam ? parseInt(leadParam, 10) : null;

  const posted = (id: number) => {
    triage.markPublished(id);
    toast.success('Posted. On to the next one');
  };

  // Pasting the comment link marks it posted too, so the lead leaves the queue.
  const savedLink = async (id: number, url: string) => {
    await triage.saveCommentLink(id, url);
  };

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[1280px]">
        <QueueHeader
          projectName={project?.name}
          title="Reply queue"
          lede={
            queue.length > 0
              ? <><span className="font-semibold tabular-nums text-ink-900">{queue.length}</span> {queue.length === 1 ? 'reply' : 'replies'} drafted and waiting. Copy one, post it on Reddit, then press Posted.</>
              : 'Replies drafted for your best leads land here.'
          }
        />

        {isLoading ? (
          <QueueSkeleton label="Loading the reply queue" />
        ) : error ? (
          <QueueError message={error} />
        ) : queue.length === 0 ? (
          <div className="max-w-[52ch] py-12">
            <h2 className="font-play text-[24px] font-bold tracking-[-0.02em] text-ink-900">Queue is clear</h2>
            <p className="mt-2 text-[14px] leading-[1.7] text-ink-600">
              Autopilot drafts a reply for every lead that scores 80 or more after each scan. You can also draft one by hand from Opportunities.
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
                viewed={triage.viewed}
                published={triage.published}
                dmSent={triage.dmSent}
                onViewed={triage.markViewed}
                onPublished={triage.markPublished}
                onSaveLink={savedLink}
                replyStatus={triage.replyStatus}
                onDmSent={triage.markDmSent}
                remaining={0}
                onLoadMore={() => {}}
                initialSelectedId={initialSelectedId}
                footer={(m, pos) => (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] tabular-nums text-ink-400">
                      {pos.index + 1} of {pos.total}
                    </span>
                    <button onClick={() => posted(m.id)} className={BTN_SECONDARY}>
                      <Check className="h-4 w-4 text-[#059669]" aria-hidden="true" />
                      Posted
                    </button>
                  </div>
                )}
              />
            </div>
            <div className="-ml-4 border-t border-black/[0.06] lg:hidden">
              {queue.map((m) => (
                <MentionCard
                  key={m.id}
                  mention={m}
                  viewed={triage.viewed.has(m.id)}
                  publishedUrl={triage.published[m.id]}
                  onViewed={triage.markViewed}
                  onPublished={posted}
                  onSaveLink={savedLink}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </PaymentGuard>
  );
}
