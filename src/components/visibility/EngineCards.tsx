'use client';

import { VisibilityEngineScore } from '@/lib/api';
import { engineLabel } from './engines';

interface EngineCardsProps {
  byEngine: VisibilityEngineScore[];
}

/**
 * Above this many answers a per-answer meter stops reading as countable pips
 * and becomes stripes, so it falls back to a single proportional bar.
 */
const MAX_SEGMENTS = 8;

/**
 * The meter IS the denominator. With a handful of answers per assistant (the
 * normal case) every answer gets its own segment, so "1 of 3" is visible as
 * one filled pip out of three rather than as a 33% bar that implies a sample
 * far bigger than it is.
 */
function AnswerMeter({ mentioned, total }: { mentioned: number; total: number }) {
  const label = `Named in ${mentioned} of ${total} answers`;

  if (total > 0 && total <= MAX_SEGMENTS) {
    return (
      <span role="img" aria-label={label} className="mt-2.5 flex h-1.5 gap-[2px]">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`flex-1 rounded-full ${i < mentioned ? 'bg-emerald-600' : 'bg-cream'}`}
          />
        ))}
      </span>
    );
  }

  const pct = total > 0 ? (mentioned / total) * 100 : 0;
  return (
    <span
      role="img"
      aria-label={label}
      className="mt-2.5 block h-1.5 w-full overflow-hidden rounded-full bg-cream"
    >
      <span
        className="block h-full rounded-full bg-emerald-600 transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%` }}
      />
    </span>
  );
}

export function EngineCards({ byEngine }: EngineCardsProps) {
  if (byEngine.length === 0) return null;

  const totals = byEngine.map((engine) => engine.total);
  const answers = totals.reduce((sum, n) => sum + n, 0);
  // Every assistant normally answers every question, so one shared depth is the
  // common case and worth saying once instead of four times.
  const sameDepth = totals.every((n) => n === totals[0]);

  return (
    <section aria-labelledby="by-assistant-heading">
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h2
          id="by-assistant-heading"
          className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-400"
        >
          By assistant
        </h2>
        <p className="text-[11.5px] text-ink-400 tabular-nums">
          {sameDepth
            ? `${totals[0]} answer${totals[0] === 1 ? '' : 's'} from each`
            : `${answers} answers across ${byEngine.length} assistants`}
        </p>
      </div>

      {/* One card split into cells, not four cards. The 1px offset lets every
          cell carry a top and left hairline while the container clips the
          outer ones, so the dividers stay correct at both column counts. */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover">
        <ul className="-ml-px -mt-px grid grid-cols-2 sm:grid-cols-4">
          {byEngine.map((engine) => (
            <li
              key={engine.engine}
              className="border-l border-t border-cream px-3.5 py-3 sm:px-4"
            >
              <p className="truncate text-[12px] font-semibold text-ink-700" title={engineLabel(engine.engine)}>
                {engineLabel(engine.engine)}
              </p>

              <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[21px] font-bold leading-none tracking-tight text-ink-900 tabular-nums">
                  {engine.visibility_pct}%
                </span>
                <span className="text-[11.5px] leading-none text-ink-400 tabular-nums">
                  {engine.mentioned} of {engine.total}
                </span>
              </div>

              <AnswerMeter mentioned={engine.mentioned} total={engine.total} />
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-2.5 text-[11.5px] leading-snug text-ink-400">
        We ask each model directly with live web search enabled. Results can differ slightly from the consumer apps.
      </p>
    </section>
  );
}
