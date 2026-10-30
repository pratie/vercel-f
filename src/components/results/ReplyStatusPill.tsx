'use client';

import type { ReplyStatus } from '@/lib/api';

const TONES: Record<Exclude<ReplyStatus, 'unlinked'>, { label: string; chip: string; dot: string; title: string }> = {
  live: {
    label: 'Live',
    chip: 'bg-emerald-50 text-[#047857] border-emerald-200',
    dot: 'bg-[#059669]',
    title: 'Your comment is up on Reddit',
  },
  removed: {
    label: 'Removed',
    chip: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    title: 'Moderators or Reddit removed your comment',
  },
  deleted: {
    label: 'Deleted',
    chip: 'bg-stone-100 text-ink-600 border-stone-200',
    dot: 'bg-stone-400',
    title: 'The comment was deleted from your account',
  },
  checking: {
    label: 'Checking',
    chip: 'bg-white text-ink-600 border-ink-300 border-dashed',
    dot: 'bg-amber-500 animate-pulse motion-reduce:animate-none',
    title: 'We are reading your comment on Reddit. This takes a minute.',
  },
};

/**
 * How a posted reply is doing on Reddit. Renders nothing for replies without
 * a known comment ("unlinked"), so callers can drop it in unconditionally.
 */
export function ReplyStatusPill({
  status, size = 'md', className = '',
}: { status: ReplyStatus | null | undefined; size?: 'sm' | 'md'; className?: string }) {
  if (!status || status === 'unlinked') return null;
  const t = TONES[status];
  const dims = size === 'sm' ? 'h-5 px-1.5 text-[11px]' : 'h-6 px-2 text-[12px]';
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold ${dims} ${t.chip} ${className}`}
      title={t.title}
    >
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {t.label}
    </span>
  );
}
