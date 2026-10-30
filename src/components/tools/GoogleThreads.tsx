'use client';

import { useRef, useState } from 'react';
import { ExternalLink, Loader2, Lock, MessageCircle, Search } from 'lucide-react';
import { BTN_PRIMARY, FOCUS, INPUT, INPUT_SHELL } from '@/components/marketing/styles';
import { GoogleThread, GoogleThreadsResult, publicTools, ToolError as ApiError } from '@/lib/publicTools';
import { ToolEmpty, ToolError, ToolLoading } from './ToolStates';

function age(created: number | null): string {
  if (!created) return '';
  const days = Math.floor((Date.now() / 1000 - created) / 86400);
  if (days < 1) return 'today';
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

function ReplyState({ t }: { t: GoogleThread }) {
  if (t.archived) return <span className="inline-flex items-center gap-1 font-semibold text-[#78716c]"><Lock className="h-3.5 w-3.5" aria-hidden="true" />Archived, no new replies</span>;
  if (t.locked) return <span className="inline-flex items-center gap-1 font-semibold text-[#78716c]"><Lock className="h-3.5 w-3.5" aria-hidden="true" />Locked</span>;
  return <span className="font-semibold text-[#047857]">Open for replies</span>;
}

export function GoogleThreads() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GoogleThreadsResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const run = async () => {
    const kw = keyword.trim();
    if (!kw || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await publicTools.googleThreads(kw));
      requestAnimationFrame(() => resultsRef.current?.focus({ preventScroll: true }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong on our side. Try again in a minute.');
    } finally {
      setLoading(false);
    }
  };

  const open = result?.threads.filter((t) => !t.archived && !t.locked).length ?? 0;

  return (
    <div>
      <form
        className="max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <div className={INPUT_SHELL}>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716c]" aria-hidden="true" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="best crm for freelancers"
              aria-label="Keyword"
              maxLength={80}
              className={`${INPUT} pl-10`}
            />
          </div>
          <button
            type="submit"
            disabled={loading || keyword.trim().length < 2}
            data-ml-goal="tool_used"
            data-ml-goal-tool="reddit_threads_on_google"
            className={BTN_PRIMARY}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {loading ? 'Searching...' : 'Find threads'}
          </button>
        </div>
      </form>
      <p className="mt-3 text-[14px] text-[#57534e]">Free, no signup. Use the words your buyers would type into Google.</p>

      {loading && <ToolLoading label="Searching Google, then reading each thread on Reddit..." />}
      {error && !loading && <ToolError message={error} onRetry={keyword.trim() ? run : undefined} />}

      {result && !loading && (
        <div ref={resultsRef} tabIndex={-1} className="mt-12 focus:outline-none" aria-live="polite">
          {result.threads.length === 0 ? (
            <ToolEmpty
              title="No Reddit threads on Google for this one"
              body={'Google shows no Reddit threads on its first pages for this keyword. Try a broader phrase, or the question a buyer would ask, like "best invoicing app".'}
            />
          ) : (
            <>
              <h2 className="font-play text-[26px] sm:text-[32px] font-extrabold leading-tight tracking-[-0.02em] text-[#1c1917]">
                {result.threads.length} Reddit thread{result.threads.length === 1 ? '' : 's'} on Google for &ldquo;{result.keyword}&rdquo;
              </h2>
              <p className="mt-1.5 text-[15px] text-[#57534e]">
                {open} of them still take replies. A helpful reply there gets read by everyone who searches this.
              </p>
              <ol className="mt-6 border-t border-black/[0.08]">
                {result.threads.map((t) => (
                  <li key={t.url} className={`flex gap-4 border-b border-black/[0.08] bg-white px-1 py-4 ${t.archived || t.locked ? 'opacity-70' : ''}`}>
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#1c1917] font-play text-[15px] font-extrabold tabular-nums text-[#1c1917]"
                      title={`Position ${t.position} on Google`}
                    >
                      <span className="sr-only">Google position </span>{t.position}
                    </span>
                    <div className="min-w-0 flex-1">
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className={`text-[16px] font-semibold leading-snug text-[#1c1917] hover:text-[#b83200] rounded ${FOCUS}`}
                      >
                        {t.title}
                        <ExternalLink className="ml-1.5 inline h-3.5 w-3.5 align-[-1px] text-[#a8a29e]" aria-hidden="true" />
                        <span className="sr-only">(opens Reddit)</span>
                      </a>
                      <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#57534e]">
                        <span className="font-semibold text-[#44403c]">r/{t.subreddit}</span>
                        {t.num_comments != null && (
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            {t.num_comments} comment{t.num_comments === 1 ? '' : 's'}
                          </span>
                        )}
                        {t.created_utc && <span>{age(t.created_utc)}</span>}
                        <ReplyState t={t} />
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[13px] text-[#78716c]">
                Google positions for &ldquo;{result.keyword} reddit&rdquo;, checked {result.cached ? 'in the last 24 hours' : 'just now'}. Positions vary by location.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
