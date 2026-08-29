'use client';

import { Sparkles } from 'lucide-react';

interface RunBannerProps {
  progress: number;
  message: string;
}

export function RunBanner({ progress, message }: RunBannerProps) {
  return (
    <div className="mb-6 p-4 bg-white rounded-2xl shadow-[0_1px_3px_rgba(255,69,0,0.08),0_0_0_1px_rgba(255,69,0,0.1)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-xl">
            <Sparkles className="h-4 w-4 text-orange-600 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">Asking the AI assistants…</p>
            <p className="text-xs text-ink-400">{message || 'Running your questions through ChatGPT, Gemini, Perplexity and Claude'}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-orange-600 tabular-nums">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-cream rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
