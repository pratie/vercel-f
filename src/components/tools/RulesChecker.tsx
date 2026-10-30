'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { BTN_PRIMARY, FOCUS, INPUT, INPUT_SHELL } from '@/components/marketing/styles';
import { formatMembers, formatPostsPerDay, publicTools, RulesResult, Strictness, ToolError as ApiError } from '@/lib/publicTools';
import { activityTone, ToolEmpty, ToolError, ToolLoading } from './ToolStates';

const STRICTNESS: Record<Strictness, { name: string; badge: string; label: string }> = {
  strict: { name: 'Strict', badge: 'bg-[#d13800] text-white', label: 'Strict about self-promotion' },
  careful: { name: 'Careful', badge: 'bg-[#fde68a] text-[#1c1917]', label: 'Careful: promotion with conditions' },
  open: { name: 'Open', badge: 'bg-[#059669] text-white', label: 'Open to mentions' },
  unknown: { name: 'Unclear', badge: 'bg-white text-[#1c1917]', label: 'We could not tell from the rules. Read them below.' },
};

const clean = (raw: string) => raw.trim().replace(/^(https?:\/\/)?(www\.|old\.)?reddit\.com/i, '').replace(/^\/?r\//i, '').replace(/\/+$/, '');

export function RulesChecker() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params?.get('name') || '';
  const [name, setName] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RulesResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const ranInitial = useRef(false);

  const run = useCallback(async (raw: string) => {
    const sub = clean(raw);
    if (!sub) return;
    if (!/^[A-Za-z0-9_]{2,21}$/.test(sub)) {
      setError('That is not a subreddit name. Use letters, numbers and underscores, like r/SaaS.');
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    // Keep the URL shareable: /tools/subreddit-rules-checker?name=SaaS
    router.replace(`/tools/subreddit-rules-checker?name=${encodeURIComponent(sub)}`, { scroll: false });
    try {
      setResult(await publicTools.checkRules(sub));
      requestAnimationFrame(() => resultsRef.current?.focus({ preventScroll: true }));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong on our side. Try again in a minute.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (initial && !ranInitial.current) {
      ranInitial.current = true;
      run(initial);
    }
  }, [initial, run]);

  const style = result ? STRICTNESS[result.strictness] || STRICTNESS.unknown : null;
  const flagged = result?.rules.filter((r) => r.flag).length ?? 0;

  return (
    <div>
      <form
        className="max-w-2xl"
        onSubmit={(e) => {
          e.preventDefault();
          if (!loading) run(name);
        }}
      >
        <div className={INPUT_SHELL}>
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[16px] font-semibold text-[#78716c]" aria-hidden="true">r/</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="SaaS"
              aria-label="Subreddit name"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              maxLength={80}
              className={`${INPUT} pl-9`}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !clean(name)}
            data-ml-goal="tool_used"
            data-ml-goal-tool="subreddit_rules_checker"
            className={BTN_PRIMARY}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
            {loading ? 'Checking...' : 'Check rules'}
          </button>
        </div>
      </form>
      <p className="mt-3 text-[14px] text-[#57534e]">Free, no signup. Paste a name or a reddit.com link.</p>

      {loading && <ToolLoading label="Reading the subreddit's rules..." rows={4} />}
      {error && !loading && <ToolError message={error} onRetry={clean(name) ? () => run(name) : undefined} />}

      {result && style && !loading && (
        <div ref={resultsRef} tabIndex={-1} className="mt-12 focus:outline-none" aria-live="polite">
          <div className="rounded-2xl border-2 border-[#1c1917] bg-white p-6 sm:p-8 shadow-[5px_5px_0_#1c1917]">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-play text-[28px] sm:text-[36px] font-extrabold leading-none tracking-[-0.02em] text-[#1c1917]">
                r/{result.name}
              </h2>
              <span className={`inline-flex items-center rounded-full border-2 border-[#1c1917] px-3 py-1 text-[14px] font-bold ${style.badge}`}>
                {style.name}
              </span>
            </div>
            <p className="mt-1 text-[14px] font-semibold text-[#57534e]">{style.label}</p>
            <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[#1c1917]">{result.summary}</p>
            <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-[#57534e]">
              {result.subscribers != null && <span className="tabular-nums">{formatMembers(result.subscribers)}</span>}
              {result.posts_per_day != null && <span className="tabular-nums">{formatPostsPerDay(result.posts_per_day)}</span>}
              {result.activity && result.activity !== 'Unknown' && <span className={`font-semibold ${activityTone(result.activity)}`}>{result.activity}</span>}
              {result.over18 && <span className="font-semibold text-[#b83200]">NSFW</span>}
              <a href={result.url} target="_blank" rel="noopener noreferrer nofollow" className={`inline-flex items-center gap-1 font-semibold text-[#1c1917] hover:text-[#b83200] rounded ${FOCUS}`}>
                Open on Reddit <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </p>
          </div>

          {result.rules.length === 0 ? (
            <ToolEmpty
              title="No written rules"
              body="This subreddit has not published any rules. Sitewide Reddit rules still apply, and moderators can remove anything that reads like an ad."
            />
          ) : (
            <>
              <h3 className="mt-12 font-play text-[22px] font-bold text-[#1c1917]">
                {result.rules.length} rule{result.rules.length === 1 ? '' : 's'}
                {flagged > 0 && <span className="font-sans text-[15px] font-medium text-[#57534e]">, {flagged} about promotion or links</span>}
              </h3>
              <ol className="mt-4 border-t border-black/[0.08]">
                {result.rules.map((rule, i) => (
                  <li key={`${i}-${rule.short_name}`} className="flex gap-4 border-b border-black/[0.08] bg-white px-1 py-4">
                    <span className="w-6 shrink-0 pt-0.5 text-right font-play text-[15px] font-bold tabular-nums text-[#a8a29e]">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[16px] font-semibold text-[#1c1917]">
                        {rule.short_name}
                        {rule.flag === 'strict' && <span className="rounded-full bg-[#fff1ea] px-2 py-0.5 text-[12px] font-bold text-[#b83200]">Bans promotion</span>}
                        {rule.flag === 'careful' && <span className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[12px] font-bold text-[#92400e]">Read before posting</span>}
                      </p>
                      {rule.description && (
                        <p className="mt-1 whitespace-pre-line break-words text-[15px] leading-relaxed text-[#44403c]">{rule.description}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}
          <p className="mt-4 text-[13px] text-[#78716c]">
            Rules come from Reddit, read {result.cached ? 'in the last 24 hours' : 'just now'}. The strictness label is our reading of them, so check the rules yourself before posting.
          </p>
        </div>
      )}
    </div>
  );
}
