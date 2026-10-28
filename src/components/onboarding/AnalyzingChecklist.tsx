'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';

export const ANALYSIS_STEPS = [
  'Reading your site',
  'Understanding your customers',
  'Finding competitors',
  'Picking Reddit communities',
] as const;

// Roughly how long the backend takes: a scrape plus one model call, about
// 30 seconds. The first three items tick on this schedule; the last one waits
// for the real result so nothing is marked done before it is.
const SCHEDULE_MS = [7000, 9000, 8000];
const FAST_TICK_MS = 350;

interface AnalyzingChecklistProps {
  /** The backend has answered. Remaining items tick quickly, then onComplete fires. */
  done: boolean;
  /** The backend failed. The list stops where it is. */
  failed: boolean;
  onComplete: () => void;
}

export function AnalyzingChecklist({ done, failed, onComplete }: AnalyzingChecklistProps) {
  // Number of items already ticked.
  const [ticked, setTicked] = useState(0);
  const completedRef = useRef(false);

  // Slow schedule while we wait.
  useEffect(() => {
    if (done || failed) return;
    if (ticked >= SCHEDULE_MS.length) return;
    const t = setTimeout(() => setTicked((n) => Math.max(n, ticked + 1)), SCHEDULE_MS[ticked]);
    return () => clearTimeout(t);
  }, [ticked, done, failed]);

  // Fast finish once the result is in.
  useEffect(() => {
    if (!done || failed) return;
    if (ticked < ANALYSIS_STEPS.length) {
      const t = setTimeout(() => setTicked((n) => n + 1), FAST_TICK_MS);
      return () => clearTimeout(t);
    }
    if (!completedRef.current) {
      completedRef.current = true;
      const t = setTimeout(onComplete, 450);
      return () => clearTimeout(t);
    }
  }, [done, failed, ticked, onComplete]);

  return (
    <ol className="space-y-1" aria-live="polite" aria-busy={!done && !failed}>
      {ANALYSIS_STEPS.map((label, i) => {
        const isDone = i < ticked;
        const isActive = !isDone && i === ticked && !failed;
        const isPending = !isDone && !isActive;
        return (
          <li
            key={label}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 motion-reduce:transition-none ${
              isActive ? 'bg-[#f7f6f4]' : ''
            }`}
          >
            <span
              className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-300 motion-reduce:transition-none ${
                isDone
                  ? 'border-[#059669] bg-[#059669] text-white'
                  : isActive
                    ? 'border-[#1c1917] text-ink-900'
                    : 'border-[#1c1917]/[0.15] text-transparent'
              }`}
              aria-hidden="true"
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : isActive ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
              ) : null}
            </span>
            <span
              className={`text-[15px] ${
                isDone ? 'text-ink-600' : isActive ? 'font-semibold text-ink-900' : isPending ? 'text-ink-400' : ''
              }`}
            >
              {label}
              <span className="sr-only">{isDone ? ', done' : isActive ? ', in progress' : ''}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
