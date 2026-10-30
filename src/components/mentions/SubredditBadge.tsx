'use client';

// How strict a subreddit is about self-promotion: a small chip next to
// r/name. Static (title tooltip) where it sits inside another button, like a
// lead row; expandable with the summary and a link to the rules elsewhere.

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Strictness, SubredditRules } from '@/lib/api';

const LABEL: Record<Exclude<Strictness, 'unknown'>, string> = {
  strict: 'Strict',
  careful: 'Careful',
  open: 'Open',
};

const TONE: Record<Exclude<Strictness, 'unknown'>, string> = {
  strict: 'border-[#b83200]/25 bg-[#fff1eb] text-[#b83200]',
  careful: 'border-[#b45309]/25 bg-[#fffbeb] text-[#92400e]',
  open: 'border-[#047857]/20 bg-[#ecfdf5] text-[#047857]',
};

const HELP: Record<Exclude<Strictness, 'unknown'>, string> = {
  strict: 'Removes self-promotion',
  careful: 'Self-promo with conditions',
  open: 'Self-promo is fine',
};

export function rulesUrl(name: string) {
  return `https://www.reddit.com/r/${encodeURIComponent(name)}/about/rules`;
}

interface Props {
  rules: SubredditRules | undefined;
  /** "static" renders a plain span with a tooltip, safe inside a button. */
  mode?: 'static' | 'interactive';
  size?: 'sm' | 'md';
}

export function SubredditBadge({ rules, mode = 'interactive', size = 'sm' }: Props) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!rules || rules.strictness === 'unknown') return null;
  const s = rules.strictness;
  const chip = `inline-flex items-center rounded-full border font-semibold leading-none ${TONE[s]} ${
    size === 'md' ? 'h-6 px-2 text-[11.5px]' : 'h-[18px] px-1.5 text-[10.5px]'
  }`;
  const tip = `${HELP[s]}. ${rules.summary}`.trim();

  if (mode === 'static') {
    return <span className={chip} title={tip}>{LABEL[s]}</span>;
  }

  return (
    <span ref={wrap} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-expanded={open}
        aria-controls={panelId}
        title={tip}
        className={`${chip} cursor-pointer transition-colors hover:border-current focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40`}
      >
        {LABEL[s]}
        <span className="sr-only">: r/{rules.name} self-promotion rules</span>
      </button>
      {open && (
        <span
          id={panelId}
          role="dialog"
          aria-label={`r/${rules.name} self-promotion rules`}
          className="absolute left-0 top-full z-30 mt-1.5 block w-[min(300px,calc(100vw-48px))] rounded-xl border-2 border-[#1c1917] bg-white p-3 text-left shadow-[3px_3px_0_#1c1917]"
        >
          <span className="block text-[12px] font-semibold text-ink-400">r/{rules.name} · {HELP[s]}</span>
          {rules.summary && (
            <span className="mt-1 block text-[13px] font-medium leading-snug text-ink-900">{rules.summary}</span>
          )}
          <a
            href={rulesUrl(rules.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 rounded text-[12.5px] font-semibold text-[#b83200] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
          >
            Read the rules
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </a>
        </span>
      )}
    </span>
  );
}
