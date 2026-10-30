import { AlertCircle } from 'lucide-react';

/** Placeholder rows while a tool runs. The label is announced to screen readers. */
export function ToolLoading({ label, rows = 5 }: { label: string; rows?: number }) {
  return (
    <div className="mt-10" aria-busy="true">
      <p role="status" className="text-[15px] font-medium text-[#44403c]">{label}</p>
      <ul className="mt-4 border-t border-black/[0.08]" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="border-b border-black/[0.08] px-1 py-4">
            <div className="h-4 w-1/3 rounded bg-[#f1efed] animate-pulse motion-reduce:animate-none" />
            <div className="mt-2.5 h-3 w-2/3 rounded bg-[#f5f4f2] animate-pulse motion-reduce:animate-none" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ToolError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="mt-10 flex items-start gap-3 rounded-2xl border-2 border-[#d13800]/30 bg-[#fff4f0] px-5 py-4">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#d13800]" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[15px] font-semibold text-[#1c1917]">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-[14px] font-semibold text-[#1c1917] underline decoration-2 decoration-[#ff4500] underline-offset-4 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4500]"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function ToolEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-10 rounded-2xl border-2 border-dashed border-[#1c1917]/20 px-6 py-10 text-center">
      <p className="font-play text-[20px] font-bold text-[#1c1917]">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-[#44403c]">{body}</p>
    </div>
  );
}

export function activityTone(activity: string | null | undefined): string {
  if (activity === 'Very active' || activity === 'Active') return 'text-[#047857]';
  if (activity === 'Quiet') return 'text-[#78716c]';
  return 'text-[#57534e]';
}
