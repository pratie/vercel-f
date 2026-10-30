'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { Copy, ExternalLink, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BTN_PRIMARY, BTN_SECONDARY, FOCUS, INPUT, INPUT_SHELL } from '@/components/marketing/styles';
import { FinderResult, formatMembers, formatPostsPerDay, publicTools, ToolError as ApiError } from '@/lib/publicTools';
import { activityTone, ToolEmpty, ToolError, ToolLoading } from './ToolStates';

type Mode = 'url' | 'description';

export function SubredditFinder() {
  const [mode, setMode] = useState<Mode>('url');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinderResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const value = mode === 'url' ? url.trim() : description.trim();
  const tooShort = mode === 'description' && value.length > 0 && value.length < 20;

  const run = async () => {
    if (!value || loading) return;
    if (tooShort) {
      setError('Describe your product in a sentence or two, at least 20 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await publicTools.findSubreddits(mode === 'url' ? { url: value } : { description: value });
      setResult(res);
      requestAnimationFrame(() => resultsRef.current?.focus({ preventScroll: true }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong on our side. Try again in a minute.');
    } finally {
      setLoading(false);
    }
  };

  const copyList = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.subreddits.map((s) => `r/${s.name}`).join('\n'));
      toast.success(`Copied ${result.subreddits.length} subreddits`);
    } catch {
      toast.error('Your browser blocked the clipboard. Select the names and copy them instead.');
    }
  };

  const tab = (m: Mode, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={mode === m}
      aria-controls="finder-input"
      onClick={() => {
        setMode(m);
        setError(null);
      }}
      className={`h-10 rounded-lg px-4 text-[14px] font-semibold transition-colors ${FOCUS} ${
        mode === m ? 'bg-[#1c1917] text-white' : 'text-[#44403c] hover:text-[#1c1917] hover:bg-[#f5f4f2]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div role="tablist" aria-label="What to search with" className="inline-flex gap-1 rounded-xl border-2 border-[#1c1917]/[0.12] bg-white p-1">
        {tab('url', 'Your website')}
        {tab('description', 'Describe it')}
      </div>

      <form
        id="finder-input"
        className="mt-4 max-w-3xl"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        {mode === 'url' ? (
          <div className={INPUT_SHELL}>
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716c]" aria-hidden="true" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="yourwebsite.com"
                inputMode="url"
                autoComplete="url"
                aria-label="Your website URL"
                maxLength={2048}
                className={`${INPUT} pl-10`}
              />
            </div>
            <SubmitButton loading={loading} disabled={!value} />
          </div>
        ) : (
          <div className={`${INPUT_SHELL} sm:flex-col`}>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="An invoicing app for freelance designers who hate chasing late payments."
              aria-label="Describe your product"
              aria-describedby="finder-count"
              rows={3}
              maxLength={1000}
              className={`${INPUT} h-auto min-h-[96px] resize-y py-3 leading-relaxed`}
            />
            <div className="flex items-center justify-between gap-3 pl-2">
              <span id="finder-count" className={`text-[13px] tabular-nums ${tooShort ? 'text-[#b83200]' : 'text-[#78716c]'}`}>
                {tooShort ? `${20 - value.length} more characters` : `${description.length}/1000`}
              </span>
              <SubmitButton loading={loading} disabled={!value} />
            </div>
          </div>
        )}
      </form>
      <p className="mt-3 text-[14px] text-[#57534e]">Free, no signup. Takes about 20 seconds.</p>

      {loading && <ToolLoading label={mode === 'url' ? 'Reading your site, then checking each subreddit on Reddit...' : 'Picking subreddits, then checking each one on Reddit...'} />}
      {error && !loading && <ToolError message={error} onRetry={value ? run : undefined} />}

      {result && !loading && (
        <div ref={resultsRef} tabIndex={-1} className="mt-12 focus:outline-none" aria-live="polite">
          {result.subreddits.length === 0 ? (
            <ToolEmpty
              title="No subreddits passed our checks"
              body="Every suggestion was either private, NSFW or not on Reddit. Describe your product in plainer words, naming who it is for, and try again."
            />
          ) : (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <h2 className="font-play text-[26px] sm:text-[32px] font-extrabold leading-tight tracking-[-0.02em] text-[#1c1917]">
                    {result.subreddits.length} subreddits{result.product.name ? ` for ${result.product.name}` : ''}
                  </h2>
                  {result.product.description && (
                    <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-[#57534e]">We read it as: {result.product.description}</p>
                  )}
                </div>
                <button type="button" onClick={copyList} className={`${BTN_SECONDARY} self-start sm:self-auto`}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy list
                </button>
              </div>

              <ol className="mt-6 border-t border-black/[0.08]">
                {result.subreddits.map((s) => (
                  <li key={s.name} className="border-b border-black/[0.08] bg-white px-1 py-4 sm:flex sm:items-center sm:gap-6">
                    <div className="min-w-0 flex-1">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className={`inline-flex items-center gap-1.5 text-[16px] font-bold text-[#1c1917] hover:text-[#b83200] rounded ${FOCUS}`}
                      >
                        r/{s.name}
                        <ExternalLink className="h-3.5 w-3.5 text-[#a8a29e]" aria-hidden="true" />
                        <span className="sr-only">(opens Reddit)</span>
                      </a>
                      {s.why && <p className="mt-1 text-[15px] leading-relaxed text-[#44403c]">{s.why}</p>}
                      <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#57534e]">
                        <span className="tabular-nums">{formatMembers(s.subscribers)}</span>
                        {s.posts_per_day != null && <span className="tabular-nums">{formatPostsPerDay(s.posts_per_day)}</span>}
                        {s.activity !== 'Unknown' && <span className={`font-semibold ${activityTone(s.activity)}`}>{s.activity}</span>}
                      </p>
                    </div>
                    <Link
                      href={`/tools/subreddit-rules-checker?name=${encodeURIComponent(s.name)}`}
                      className={`mt-3 inline-flex shrink-0 text-[14px] font-semibold text-[#1c1917] underline decoration-2 decoration-[#ff4500] underline-offset-4 hover:decoration-[#1c1917] rounded sm:mt-0 ${FOCUS}`}
                    >
                      Check its rules
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[13px] text-[#78716c]">
                Member counts and posts a day come from Reddit, checked {result.cached ? 'in the last 24 hours' : 'just now'}.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SubmitButton({ loading, disabled }: { loading: boolean; disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      data-ml-goal="tool_used"
      data-ml-goal-tool="subreddit_finder"
      className={BTN_PRIMARY}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
      {loading ? 'Finding...' : 'Find subreddits'}
    </button>
  );
}
