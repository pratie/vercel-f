'use client';

import type { ReactNode } from 'react';

/**
 * The header every queue page shares: project name, one heading, one line
 * that says what the queue is for, and the page's actions on the right.
 */
export function QueueHeader({
  projectName, title, lede, children,
}: {
  projectName?: string | null;
  title: string;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold text-ink-400">{projectName || ' '}</p>
        <h1 className="font-play text-[30px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
          {title}
        </h1>
        {lede && <p className="mt-1.5 max-w-[60ch] text-[13.5px] leading-[1.6] text-ink-600">{lede}</p>}
      </div>
      {children && <div className="flex items-center gap-1">{children}</div>}
    </header>
  );
}

/** Skeleton rows while a queue loads. */
export function QueueSkeleton({ label }: { label: string }) {
  return (
    <div className="border-t-2 border-[#1c1917]/[0.08]" aria-busy="true" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse border-b border-black/[0.06] py-4 motion-reduce:animate-none">
          <div className="h-[15px] rounded bg-[#f0efed]" style={{ width: `${[72, 58, 66, 80, 54][i]}%` }} />
          <div className="mt-2.5 h-[11px] w-1/2 rounded bg-[#f6f5f3]" />
        </div>
      ))}
    </div>
  );
}

/** "Could not load" with a retry. */
export function QueueError({ message }: { message: string }) {
  return (
    <div className="py-20 text-center">
      <p className="text-[15px] font-semibold text-ink-900">Could not load this project</p>
      <p className="mt-1.5 text-[13px] text-ink-400">{message}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border-2 border-[#1c1917] bg-[#d13800] px-4 text-[13px] font-semibold text-white shadow-[3px_3px_0_#1c1917] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
