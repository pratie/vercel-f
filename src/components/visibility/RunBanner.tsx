'use client';

interface RunBannerProps {
  progress: number;
  message: string;
}

/** One line of status over a thin progress rule. Matches the leads scan banner. */
export function RunBanner({ progress, message }: RunBannerProps) {
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <p className="truncate text-[13px] text-ink-600">
          <span className="font-semibold text-ink-900">Asking the assistants.</span>{' '}
          <span className="text-ink-400">{message || 'Running your questions through ChatGPT, Gemini, Perplexity and Claude'}</span>
        </p>
        <span className="shrink-0 text-[13px] tabular-nums text-ink-400">{progress}%</span>
      </div>
      <div
        className="h-1 w-full overflow-hidden rounded-full bg-black/[0.08]"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Check progress"
      >
        <div
          className="h-full bg-[#ff4500] transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
