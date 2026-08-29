'use client';

import { Bot } from 'lucide-react';
import { VisibilityEngineScore } from '@/lib/api';
import { engineLabel } from './engines';

interface EngineCardsProps {
  byEngine: VisibilityEngineScore[];
}

export function EngineCards({ byEngine }: EngineCardsProps) {
  if (byEngine.length === 0) return null;

  return (
    <section>
      <h2 className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-400 mb-2.5">
        By assistant
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {byEngine.map((engine) => {
          const strong = engine.visibility_pct >= 50;
          return (
            <div
              key={engine.engine}
              className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                  strong ? 'bg-emerald-50 text-emerald-600' : 'bg-cream text-ink-400'
                }`}>
                  <Bot className="h-3 w-3" />
                </span>
                <span className="text-[12.5px] font-semibold text-ink-900 truncate">
                  {engineLabel(engine.engine)}
                </span>
              </div>

              <div
                className="text-[26px] font-bold text-ink-900 leading-none tracking-tight tabular-nums"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {engine.visibility_pct}%
              </div>

              <div className="mt-2.5 h-1.5 w-full rounded-full bg-cream overflow-hidden">
                <div
                  className={`h-full rounded-full transition-[width] duration-700 ease-out ${
                    strong ? 'bg-emerald-500' : 'bg-orange-500'
                  }`}
                  style={{ width: `${Math.max(engine.visibility_pct, engine.visibility_pct > 0 ? 3 : 0)}%` }}
                />
              </div>

              <p className="mt-2 text-[11.5px] text-ink-400 tabular-nums">
                Named in {engine.mentioned} of {engine.total} answers
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-2.5 text-[11.5px] text-ink-400 leading-snug">
        We ask each model directly with live web search enabled. Results can differ slightly from the consumer apps.
      </p>
    </section>
  );
}
