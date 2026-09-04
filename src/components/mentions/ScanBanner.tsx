'use client';

interface ScanBannerProps {
  progress: number;
  message: string;
}

/** A hairline progress rule with one line of status. No box, no icon tile. */
export function ScanBanner({ progress, message }: ScanBannerProps) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between gap-4 mb-2">
        <p className="text-[12.5px] text-ink-600 truncate">
          <span className="text-ink-900">Scanning Reddit.</span>{' '}
          <span className="text-ink-400">{message || 'Finding conversations that match your keywords'}</span>
        </p>
        <span className="text-[12.5px] text-ink-400 tabular-nums shrink-0">{progress}%</span>
      </div>
      <div
        className="h-px w-full bg-black/[0.08] overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Scan progress"
      >
        <div
          className="h-full bg-[#ff4500] transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
