'use client';

import { FormEvent, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Globe, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { api, hasActiveAccess, ProductAnalysis, SubredditInfo } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { BTN_PRIMARY, BTN_QUIET, FIELD, STICKER_PANEL } from '@/components/ui/sticker';
import { WizardShell } from '@/components/onboarding/WizardShell';
import { AnalyzingChecklist } from '@/components/onboarding/AnalyzingChecklist';
import { ChipInput, RemovableChip, ToggleChip, formatMembers } from '@/components/onboarding/Chips';

type Step = 'url' | 'analyzing' | 'review' | 'communities';

const PENDING_URL_KEY = 'pending_analyze_url';
const SUBREDDIT_RE = /^[A-Za-z0-9_]{2,21}$/;

type SubInfoState = Record<string, SubredditInfo | 'loading' | undefined>;

function normaliseUrl(raw: string): string {
  let v = raw.trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v;
}

function looksLikeUrl(v: string): boolean {
  const host = v.replace(/^https?:\/\//i, '').split('/')[0];
  return host.includes('.') && !/\s/.test(host);
}

function NewProjectWizard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>('url');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  // Studying
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const analysisRef = useRef<ProductAnalysis | null>(null);
  const runningUrlRef = useRef<string | null>(null);

  // Check
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [suggestedCompetitors, setSuggestedCompetitors] = useState<string[]>([]);
  const [confirmedCompetitors, setConfirmedCompetitors] = useState<string[]>([]);
  const [reviewBusy, setReviewBusy] = useState(false);

  // Where to look
  const [keywords, setKeywords] = useState<string[]>([]);
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [subInfo, setSubInfo] = useState<SubInfoState>({});
  const [subLookupBusy, setSubLookupBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<{ message: string; upgrade: boolean } | null>(null);

  // Payment is checked once so the paywall can be shown at the moment it
  // matters (creating), not before someone has seen their own keywords.
  const [hasPaid, setHasPaid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    api.getPaymentStatus().then((s) => setHasPaid(hasActiveAccess(s))).catch(() => setHasPaid(null));
  }, [user, router]);

  // ----- Step 1: URL -------------------------------------------------------

  const startAnalysis = useCallback((raw: string) => {
    const target = normaliseUrl(raw);
    if (!target || !looksLikeUrl(target)) {
      setUrlError('Enter a website address, like yourproduct.com');
      return;
    }
    setUrlError(null);
    setUrl(target);
    setAnalysisDone(false);
    setAnalysisError(null);
    analysisRef.current = null;
    setStep('analyzing');
  }, []);

  // Hand-off from the public funnel: the landing page and /explore stash the
  // URL, sign-up sends the person here, and the analysis starts by itself.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || !user) return;
    const fromQuery = searchParams.get('url');
    const fromSession = typeof window !== 'undefined' ? sessionStorage.getItem(PENDING_URL_KEY) : null;
    const pending = (fromQuery || fromSession || '').trim();
    if (!pending) return;
    autoStarted.current = true;
    startAnalysis(pending);
  }, [user, searchParams, startAnalysis]);

  const onSubmitUrl = (e: FormEvent) => {
    e.preventDefault();
    startAnalysis(url);
  };

  // ----- Step 2: Studying ----------------------------------------------------

  useEffect(() => {
    if (step !== 'analyzing' || !url) return;
    const runKey = `${url}#${attempt}`;
    if (runningUrlRef.current === runKey) return;
    runningUrlRef.current = runKey;
    let cancelled = false;

    api
      .analyzeProductUrl(url)
      .then((result) => {
        if (cancelled) return;
        analysisRef.current = result;
        setAnalysisDone(true);
      })
      .catch((err: any) => {
        if (cancelled) return;
        runningUrlRef.current = null;
        setAnalysisError(err?.message || 'We could not read that website.');
      });

    return () => {
      cancelled = true;
    };
  }, [step, url, attempt]);

  const onAnalysisComplete = useCallback(() => {
    const result = analysisRef.current;
    if (!result) return;
    setName(result.name);
    setDescription(result.description);
    setSuggestedCompetitors(result.competitors);
    setConfirmedCompetitors(result.competitors.slice(0, 3));
    setKeywords(result.keywords);
    setSubreddits(result.subreddits);
    runningUrlRef.current = null;
    setStep('review');
  }, []);

  const retryAnalysis = () => {
    runningUrlRef.current = null;
    setAnalysisError(null);
    setAnalysisDone(false);
    setAttempt((a) => a + 1);
  };

  const enterManually = () => {
    runningUrlRef.current = null;
    setAnalysisError(null);
    setName('');
    setDescription('');
    setSuggestedCompetitors([]);
    setConfirmedCompetitors([]);
    setKeywords([]);
    setSubreddits([]);
    setStep('review');
  };

  // ----- Step 3: Check -------------------------------------------------------

  const toggleCompetitor = (c: string) =>
    setConfirmedCompetitors((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]));

  const addCompetitor = (raw: string) => {
    const v = raw.trim().slice(0, 100);
    if (!v) return;
    if (confirmedCompetitors.some((c) => c.toLowerCase() === v.toLowerCase())) return;
    if (confirmedCompetitors.length >= 10) {
      toast.error('You can track up to 10 competitors per project.');
      return;
    }
    if (!suggestedCompetitors.some((c) => c.toLowerCase() === v.toLowerCase())) {
      setSuggestedCompetitors((cur) => [...cur, v]);
    }
    setConfirmedCompetitors((cur) => [...cur, v]);
  };

  const continueFromReview = async () => {
    if (!name.trim()) {
      toast.error('Give your product a name.');
      return;
    }
    if (description.trim().length < 10) {
      toast.error('Say a little more about what it does, at least one sentence.');
      return;
    }
    // Manual path: nothing was drafted yet, so draft keywords and subreddits
    // from the name and description now.
    if (keywords.length === 0 || subreddits.length === 0) {
      setReviewBusy(true);
      try {
        const draft = await api.analyzeInitial({ name: name.trim(), description: description.trim() });
        if (keywords.length === 0) setKeywords(draft.keywords || []);
        if (subreddits.length === 0) setSubreddits((draft.subreddits || []).map((s) => s.replace(/^r\//, '')));
      } catch (err: any) {
        toast.error(err?.message || 'Could not draft keywords. Add a few by hand on the next step.');
      } finally {
        setReviewBusy(false);
      }
    }
    setStep('communities');
  };

  // ----- Step 4: Where to look -----------------------------------------------

  // Member counts for whatever subreddits are listed and not yet looked up.
  useEffect(() => {
    if (step !== 'communities') return;
    const missing = subreddits.filter((s) => subInfo[s.toLowerCase()] === undefined);
    if (missing.length === 0) return;
    setSubInfo((cur) => {
      const next = { ...cur };
      missing.forEach((s) => (next[s.toLowerCase()] = 'loading'));
      return next;
    });
    api
      .getSubredditInfo(missing)
      .then((rows) => {
        setSubInfo((cur) => {
          const next = { ...cur };
          rows.forEach((r) => (next[r.name.toLowerCase()] = r));
          // Anything Reddit did not echo back is treated as unknown.
          missing.forEach((s) => {
            if (next[s.toLowerCase()] === 'loading') next[s.toLowerCase()] = { name: s, subscribers: 0, exists: false };
          });
          return next;
        });
      })
      .catch(() => {
        setSubInfo((cur) => {
          const next = { ...cur };
          missing.forEach((s) => (next[s.toLowerCase()] = { name: s, subscribers: 0, exists: true }));
          return next;
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, subreddits]);

  const removeSubreddit = (s: string) => setSubreddits((cur) => cur.filter((x) => x !== s));

  const addSubreddit = async (raw: string) => {
    const v = raw.trim().replace(/^\/?r\//i, '');
    if (!SUBREDDIT_RE.test(v)) {
      toast.error('Subreddit names are 2 to 21 letters, numbers or underscores.');
      return;
    }
    if (subreddits.some((s) => s.toLowerCase() === v.toLowerCase())) {
      toast.info(`r/${v} is already on the list.`);
      return;
    }
    if (subreddits.length >= 20) {
      toast.error('Twenty subreddits is plenty for one project.');
      return;
    }
    setSubLookupBusy(true);
    try {
      const [info] = await api.getSubredditInfo([v]);
      if (!info || !info.exists) {
        toast.error(`We could not find r/${v} on Reddit. Check the spelling.`);
        return;
      }
      setSubInfo((cur) => ({ ...cur, [info.name.toLowerCase()]: info }));
      setSubreddits((cur) => [...cur, info.name]);
    } catch (err: any) {
      toast.error(err?.message || 'Could not look that subreddit up right now.');
    } finally {
      setSubLookupBusy(false);
    }
  };

  const removeKeyword = (k: string) => setKeywords((cur) => cur.filter((x) => x !== k));

  const addKeyword = (raw: string) => {
    const v = raw.trim().toLowerCase().slice(0, 80);
    if (!v) return;
    if (keywords.some((k) => k.toLowerCase() === v)) return;
    if (keywords.length >= 25) {
      toast.error('Twenty-five keywords is plenty for one project.');
      return;
    }
    setKeywords((cur) => [...cur, v]);
  };

  const createProject = async () => {
    setCreateError(null);
    if (keywords.length === 0) {
      toast.error('Add at least one keyword.');
      return;
    }
    if (subreddits.length === 0) {
      toast.error('Add at least one subreddit.');
      return;
    }
    if (hasPaid === false) {
      // They have seen their keywords: this is the moment to ask. The URL
      // stays stashed so the wizard restarts after payment.
      if (url) sessionStorage.setItem(PENDING_URL_KEY, url);
      toast.info('Almost there. Unlock SneakyGuy to start scanning these threads.');
      router.push('/upgrade');
      return;
    }

    setCreating(true);
    try {
      const project = await api.createProject({
        name: name.trim(),
        description: description.trim(),
        keywords,
        subreddits: subreddits.map((s) => s.replace(/^r\//, '')),
      });
      sessionStorage.removeItem(PENDING_URL_KEY);

      // Competitors feed the AI visibility report. A failure here is not
      // worth stopping the first scan for.
      await Promise.allSettled(confirmedCompetitors.map((c) => api.addVisibilityCompetitor(project.id, c)));

      // Everything that needs the API answers before the scan starts: the
      // scan's background task runs on the server's event loop and holds
      // other requests until it finishes.
      try {
        const all = await api.getProjects();
        window.dispatchEvent(new CustomEvent('sneakyguy:projects-updated', { detail: all }));
      } catch {
        /* the sidebar refreshes itself on the next load */
      }

      // Fire and forget. The response comes back as soon as the scan is
      // queued, and the request keeps going after we navigate away.
      api.analyzeReddit({ brand_id: String(project.id), keywords, subreddits }).catch((err) => {
        console.error('First scan did not start:', err);
      });

      router.push(`/mentions/${project.id}`);
    } catch (err: any) {
      const status = err?.statusCode;
      if (status === 403) {
        setCreateError({ message: err?.message || 'Your plan does not allow another project.', upgrade: true });
      } else if (status === 402) {
        toast.error(err?.message || 'Your subscription has expired. Please renew to continue.');
        sessionStorage.removeItem('payment-status-v1');
        if (url) sessionStorage.setItem(PENDING_URL_KEY, url);
        router.push('/upgrade');
      } else {
        setCreateError({ message: err?.message || 'Could not create the project. Please try again.', upgrade: false });
      }
      setCreating(false);
    }
  };

  if (!user) return null;

  // ----- Render --------------------------------------------------------------

  if (step === 'url') {
    return (
      <WizardShell
        step={1}
        title="Paste your product URL"
        lead="We read your site, work out who buys it, and find the Reddit threads where those people are asking for it."
      >
        <form onSubmit={onSubmitUrl} noValidate>
          <div className={`${STICKER_PANEL} p-2`}>
            <label className="relative block">
              <span className="sr-only">Your product&apos;s website</span>
              <Globe aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
              <input
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (urlError) setUrlError(null);
                }}
                placeholder="yourproduct.com"
                inputMode="url"
                autoComplete="url"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                aria-invalid={!!urlError}
                aria-describedby={urlError ? 'url-error' : undefined}
                className="h-14 w-full rounded-xl bg-transparent pl-12 pr-4 text-[17px] text-ink-900 placeholder:text-ink-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50"
              />
            </label>
          </div>
          {urlError && (
            <p id="url-error" role="alert" className="mt-2 text-[13px] font-medium text-[#b83200]">
              {urlError}
            </p>
          )}
          <button type="submit" className={`${BTN_PRIMARY} mt-4 h-12 w-full text-[15px]`}>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Analyze my product
          </button>
        </form>
        <p className="mt-4 text-[13px] text-ink-400">
          Takes about 30 seconds. You can edit everything before anything is saved, or{' '}
          <button
            type="button"
            onClick={enterManually}
            className="rounded font-medium text-ink-600 underline decoration-ink-300 underline-offset-2 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
          >
            enter the details yourself
          </button>
          .
        </p>
      </WizardShell>
    );
  }

  if (step === 'analyzing') {
    const host = url.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    return (
      <WizardShell
        step={2}
        title="Studying your product"
        lead={
          <>
            Reading <span className="font-semibold text-ink-900">{host}</span> and working out where its customers hang out.
          </>
        }
      >
        <div className={`${STICKER_PANEL} p-3 sm:p-4`}>
          <AnalyzingChecklist done={analysisDone} failed={!!analysisError} onComplete={onAnalysisComplete} />
        </div>

        {analysisError ? (
          <div role="alert" className="mt-4 rounded-xl border-2 border-[#1c1917] bg-[#fff4ef] p-4">
            <p className="text-[14px] font-semibold text-ink-900">That did not work</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-ink-600">{analysisError}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={retryAnalysis} className={BTN_PRIMARY}>
                Try again
              </button>
              <button
                type="button"
                onClick={() => {
                  runningUrlRef.current = null;
                  setStep('url');
                }}
                className={BTN_QUIET}
              >
                Use a different URL
              </button>
              <button type="button" onClick={enterManually} className={BTN_QUIET}>
                Enter details myself
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-[13px] text-ink-400">Usually about 30 seconds. You can change anything it gets wrong.</p>
        )}
      </WizardShell>
    );
  }

  if (step === 'review') {
    const manual = !analysisRef.current;
    return (
      <WizardShell
        step={3}
        title={manual ? 'Tell us about your product' : 'Did we get this right?'}
        lead={
          manual
            ? 'A name and a plain sentence or two is enough. We draft the rest from it.'
            : 'This is how we will describe you in replies. Fix anything that is off.'
        }
        footer={
          <button
            type="button"
            onClick={() => {
              runningUrlRef.current = null;
              setStep('url');
            }}
            className={BTN_QUIET}
          >
            Back
          </button>
        }
      >
        <div className="space-y-5">
          <div>
            <label htmlFor="product-name" className="block text-[13px] font-semibold text-ink-900">
              Product name
            </label>
            <input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              className={`${FIELD} mt-1.5 w-full`}
              placeholder="Acme"
            />
          </div>

          <div>
            <label htmlFor="product-description" className="block text-[13px] font-semibold text-ink-900">
              What it does and who it is for
            </label>
            <textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
              className="mt-1.5 w-full rounded-xl border-2 border-[#1c1917]/[0.12] bg-white px-3 py-2.5 text-[13.5px] leading-relaxed text-ink-900 placeholder:text-ink-300 transition-colors focus:border-[#1c1917] focus:outline-none"
              placeholder="Acme finds Reddit threads where people ask for a tool like yours, and drafts the reply."
            />
          </div>

          <div className={`${STICKER_PANEL} p-4`}>
            <p className="text-[13px] font-semibold text-ink-900">Competitors</p>
            <p className="mt-0.5 text-[12.5px] text-ink-400">
              {suggestedCompetitors.length > 0
                ? 'Tap the ones people would compare you with. We catch threads that mention them, like "X alternative?"'
                : 'Who would people compare you with? We catch threads that mention them, like "X alternative?"'}
            </p>
            {suggestedCompetitors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Suggested competitors">
                {suggestedCompetitors.map((c) => (
                  <ToggleChip key={c} label={c} selected={confirmedCompetitors.includes(c)} onToggle={() => toggleCompetitor(c)} />
                ))}
              </div>
            )}
            <div className="mt-3">
              <ChipInput placeholder="Add a competitor" ariaLabel="Add a competitor" onAdd={addCompetitor} />
            </div>
          </div>

          <button type="button" onClick={continueFromReview} disabled={reviewBusy} className={`${BTN_PRIMARY} h-12 w-full text-[15px]`}>
            {reviewBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                Drafting keywords
              </>
            ) : (
              <>
                {manual ? 'Continue' : 'Looks good, continue'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </WizardShell>
    );
  }

  // step === 'communities'
  return (
    <WizardShell
      step={4}
      title="Where we'll find your customers"
      lead="The phrases people type when they need what you sell, and the communities they type them in."
      footer={
        <button type="button" onClick={() => setStep('review')} disabled={creating} className={BTN_QUIET}>
          Back
        </button>
      }
    >
      <div className="space-y-5">
        <section className={`${STICKER_PANEL} p-4`} aria-labelledby="kw-heading">
          <h2 id="kw-heading" className="text-[13px] font-semibold text-ink-900">
            Buying-intent phrases
          </h2>
          <p className="mt-0.5 text-[12.5px] text-ink-400">We look for threads that say these, or mean them.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {keywords.length === 0 && <p className="text-[13px] text-ink-400">No keywords yet. Add a few below.</p>}
            {keywords.map((k) => (
              <RemovableChip key={k} label={k} onRemove={() => removeKeyword(k)} removeLabel={`Remove keyword ${k}`} />
            ))}
          </div>
          <div className="mt-3">
            <ChipInput placeholder="e.g. find customers" ariaLabel="Add a keyword" onAdd={addKeyword} />
          </div>
        </section>

        <section className={`${STICKER_PANEL} p-4`} aria-labelledby="sub-heading">
          <h2 id="sub-heading" className="text-[13px] font-semibold text-ink-900">
            Subreddits
          </h2>
          <p className="mt-0.5 text-[12.5px] text-ink-400">Member counts are live from Reddit. Drop any that do not fit.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {subreddits.length === 0 && <p className="text-[13px] text-ink-400">No subreddits yet. Search for one below.</p>}
            {subreddits.map((s) => {
              const info = subInfo[s.toLowerCase()];
              const loading = info === 'loading' || info === undefined;
              const missing = !loading && info && !info.exists;
              const label = !loading && info && info.exists ? info.name : s;
              return (
                <RemovableChip
                  key={s}
                  label={`r/${label}`}
                  tone={missing ? 'warn' : 'default'}
                  detail={
                    loading ? (
                      <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" aria-label="Loading member count" />
                    ) : missing ? (
                      'not found'
                    ) : (
                      formatMembers(info.subscribers)
                    )
                  }
                  onRemove={() => removeSubreddit(s)}
                  removeLabel={`Remove r/${s}`}
                />
              );
            })}
          </div>
          <div className="mt-3">
            <ChipInput prefix="r/" placeholder="subredditname" ariaLabel="Add a subreddit" onAdd={addSubreddit} busy={subLookupBusy} />
          </div>
        </section>

        {createError && (
          <div role="alert" className="rounded-xl border-2 border-[#1c1917] bg-[#fff4ef] p-4">
            <p className="text-[13.5px] leading-relaxed text-ink-900">{createError.message}</p>
            {createError.upgrade && (
              <Link
                href="/upgrade"
                className="mt-2 inline-flex items-center gap-1 text-[13px] font-semibold text-[#b83200] underline decoration-[#ff4500]/40 underline-offset-2 hover:decoration-[#b83200] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
              >
                Upgrade
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}

        <button type="button" onClick={createProject} disabled={creating} className={`${BTN_PRIMARY} h-12 w-full text-[15px]`}>
          {creating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Creating your project
            </>
          ) : (
            <>
              Create project and start scanning
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </button>
        <p className="text-center text-[12.5px] text-ink-400">The first scan runs right away. New threads are checked automatically after that.</p>
      </div>
    </WizardShell>
  );
}

export default function NewProjectPage() {
  // useSearchParams needs a Suspense boundary for the static shell.
  return (
    <Suspense fallback={null}>
      <NewProjectWizard />
    </Suspense>
  );
}
