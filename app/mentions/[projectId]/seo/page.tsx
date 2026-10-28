'use client';

// SEO opportunities: the Reddit threads the AI assistants read when they
// answer this project's buying questions. One job per row: get a helpful
// comment into that thread, because the engines will read it again.

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowUpRight, Check, MessageSquare, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentGuard } from '@/components/PaymentGuard';
import { QueueError, QueueHeader, QueueSkeleton } from '@/components/mentions/QueueHeader';
import { useAuth } from '@/components/AuthContext';
import { api, Project, SeoOpportunitiesResponse, SeoThread } from '@/lib/api';
import { engineLabel, formatRunDate } from '@/components/visibility/engines';
import { BTN_PRIMARY, BTN_QUIET, BTN_SECONDARY, STICKER_PANEL } from '@/components/ui/sticker';

const RUN_POLL_MS = 5000;

type RunState = 'idle' | 'running' | 'done';

export default function SeoOpportunitiesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [data, setData] = useState<SeoOpportunitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runState, setRunState] = useState<RunState>('idle');
  const [runMessage, setRunMessage] = useState('');

  const load = useCallback(async () => {
    if (!projectId) return null;
    const fresh = await api.getSeoOpportunities(projectId);
    setData(fresh);
    return fresh;
  }, [projectId]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!projectId || isNaN(parseInt(projectId, 10))) {
      toast.error('Invalid project');
      router.push('/projects');
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const [projectData, fresh] = await Promise.all([
          api.getProject(projectId),
          api.getSeoOpportunities(projectId),
        ]);
        if (cancelled) return;
        setProject(projectData);
        setData(fresh);
        // A check started elsewhere should show as running here too.
        try {
          const status = await api.getVisibilityStatus(projectId);
          if (!cancelled && status.status === 'running') {
            setRunState('running');
            setRunMessage(status.message || '');
          }
        } catch { /* status is a nice-to-have */ }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load SEO opportunities.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  // Poll while a check runs, then reload the list once it completes.
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (runState !== 'running' || !projectId) return;
    let stopped = false;
    const tick = async () => {
      if (stopped) return;
      try {
        const status = await api.getVisibilityStatus(projectId);
        if (stopped) return;
        setRunMessage(status.message || '');
        if (status.status === 'completed') {
          const fresh = await load();
          if (stopped) return;
          setRunState('done');
          toast.success(
            fresh && fresh.summary.threads > 0
              ? `Found ${fresh.summary.threads} Reddit ${fresh.summary.threads === 1 ? 'thread' : 'threads'} the AI answers are built on`
              : 'Check complete'
          );
          return;
        }
        if (status.status === 'failed') {
          setRunState('idle');
          toast.error('The check failed', { description: status.message || 'Try again in a few minutes.' });
          return;
        }
      } catch { /* keep polling */ }
      pollTimer.current = setTimeout(tick, RUN_POLL_MS);
    };
    pollTimer.current = setTimeout(tick, RUN_POLL_MS);
    return () => {
      stopped = true;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, [runState, projectId, load]);

  const startRun = useCallback(async () => {
    if (!projectId || runState === 'running') return;
    try {
      const response = await api.runVisibilityCheck(projectId);
      if (response.status === 'started' || response.status === 'already_running') {
        setRunState('running');
        setRunMessage('Asking the assistants your buying questions');
      } else if (response.status === 'no_prompts') {
        toast.error('Add at least one buying question first', {
          description: 'Questions live on the AI check page.',
        });
        router.push(`/visibility/${projectId}`);
      } else {
        toast.error(response.message || 'Could not start the check');
      }
    } catch (e) {
      toast.error('Could not start the check', { description: e instanceof Error ? e.message : undefined });
    }
  }, [projectId, runState, router]);

  const onImported = useCallback((postId: string, leadId: number) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        threads: prev.threads.map((t) =>
          t.reddit_post_id === postId
            ? { ...t, lead: { id: leadId, num_comments: t.lead?.num_comments ?? 0, score: t.lead?.score ?? 0, relevance_score: 0, draft_reply: null } }
            : t
        ),
      };
    });
  }, []);

  const summary = data?.summary;
  const hasRun = !!data && data.run_id !== null;

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[1280px]">
        <QueueHeader
          projectName={project?.name}
          title="SEO opportunities"
          lede="Reddit threads that ChatGPT and Perplexity read when buyers ask about your category. A helpful comment here keeps showing up in answers for months."
        />

        {isLoading ? (
          <QueueSkeleton label="Loading SEO opportunities" />
        ) : error ? (
          <QueueError message={error} />
        ) : !hasRun ? (
          <FirstRun projectId={projectId} runState={runState} runMessage={runMessage} onStart={startRun} />
        ) : (
          <>
            <HeaderStats data={data!} projectId={projectId} runState={runState} runMessage={runMessage} />

            {data!.threads.length === 0 ? (
              <div className="max-w-[56ch] py-10">
                <h2 className="font-play text-[24px] font-bold tracking-[-0.02em] text-ink-900">No Reddit threads in the latest answers</h2>
                <p className="mt-2 text-[14px] leading-[1.7] text-ink-600">
                  The assistants answered {summary!.answers_total} {summary!.answers_total === 1 ? 'time' : 'times'} without citing Reddit.
                  That changes week to week. The next check runs {formatRunDate(data!.next_check_at) || 'next week'}, or add broader buying questions on the AI check page.
                </p>
                <Link href={`/visibility/${projectId}`} className={`${BTN_SECONDARY} mt-6`}>
                  Edit the questions
                </Link>
              </div>
            ) : (
              <ol className="mt-6 border-t-2 border-[#1c1917]/[0.08]">
                {data!.threads.map((thread, index) => (
                  <ThreadRow
                    key={thread.reddit_post_id}
                    thread={thread}
                    index={index}
                    projectId={projectId}
                    onImported={onImported}
                  />
                ))}
              </ol>
            )}
          </>
        )}
      </div>
    </PaymentGuard>
  );
}

/* ── Header ────────────────────────────────────────────────────────────── */

function HeaderStats({
  data, projectId, runState, runMessage,
}: {
  data: SeoOpportunitiesResponse;
  projectId: string;
  runState: RunState;
  runMessage: string;
}) {
  const s = data.summary;
  return (
    <section className={`${STICKER_PANEL} p-5 sm:p-6`} aria-label="Summary">
      <div className="grid gap-5 sm:grid-cols-3">
        <Stat
          big={`${s.threads}`}
          label={`${s.threads === 1 ? 'thread' : 'threads'} cited by AI answers`}
          sub={`for ${s.questions_covered} of ${s.questions_total} buying ${s.questions_total === 1 ? 'question' : 'questions'}`}
        />
        <Stat
          big={`${s.named_in} of ${s.answers_total}`}
          label="AI answers name you"
          sub={
            <Link href={`/visibility/${projectId}`} className="text-ink-600 underline decoration-ink-300 underline-offset-2 hover:text-ink-900">
              See the full AI check
            </Link>
          }
        />
        <Stat
          big={formatRunDate(data.last_checked_at) || 'Just now'}
          label="last checked"
          sub={
            runState === 'running'
              ? <span className="text-[#d13800]">{runMessage || 'Check running now'}</span>
              : `Next check ${formatRunDate(data.next_check_at) || 'next week'}`
          }
        />
      </div>
    </section>
  );
}

function Stat({ big, label, sub }: { big: string; label: string; sub?: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="font-play text-[28px] font-extrabold leading-none tracking-[-0.02em] text-ink-900 tabular-nums">{big}</p>
      <p className="mt-1.5 text-[13.5px] font-semibold text-ink-900">{label}</p>
      {sub && <p className="mt-0.5 text-[12.5px] text-ink-600">{sub}</p>}
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────────────────── */

function FirstRun({
  projectId, runState, runMessage, onStart,
}: {
  projectId: string;
  runState: RunState;
  runMessage: string;
  onStart: () => void;
}) {
  const running = runState === 'running';
  return (
    <div className={`${STICKER_PANEL} max-w-[640px] p-6 sm:p-8`}>
      <h2 className="font-play text-[24px] font-bold tracking-[-0.02em] text-ink-900">No check yet</h2>
      <p className="mt-2 text-[14px] leading-[1.7] text-ink-600">
        We ask ChatGPT, Gemini, Perplexity and Claude your buying questions with web search on, then keep every Reddit thread they cite.
        Those threads are your SEO opportunities. The check takes a couple of minutes.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onStart} disabled={running} className={BTN_PRIMARY}>
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {running ? 'Checking' : 'Run the first check'}
        </button>
        <Link href={`/visibility/${projectId}`} className={BTN_QUIET}>
          Edit the questions first
        </Link>
      </div>
      {running && (
        <p className="mt-4 text-[13px] text-ink-600" role="status" aria-live="polite">
          {runMessage || 'Asking the assistants your buying questions'}. This page updates on its own.
        </p>
      )}
    </div>
  );
}

/* ── Thread row ────────────────────────────────────────────────────────── */

function ThreadRow({
  thread, index, projectId, onImported,
}: {
  thread: SeoThread;
  index: number;
  projectId: string;
  onImported: (postId: string, leadId: number) => void;
}) {
  const [importing, setImporting] = useState(false);
  const lead = thread.lead;

  const addToLeads = async () => {
    if (importing) return;
    setImporting(true);
    try {
      const res = await api.importSeoThread(projectId, thread.url);
      onImported(thread.reddit_post_id, res.lead_id);
      toast.success(res.created ? 'Added to your leads' : 'Already in your leads', {
        description: 'Draft a reply when you are ready.',
      });
    } catch (e) {
      toast.error('Could not add this thread', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setImporting(false);
    }
  };

  const named = thread.named_in;
  const cited = thread.times_cited;

  return (
    <li className="border-b border-black/[0.08] py-5">
      <div className="flex gap-4">
        <span
          aria-hidden="true"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1c1917] font-play text-[13px] font-extrabold tabular-nums text-ink-900 sm:flex"
        >
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-ink-600">
            {thread.subreddit && <span className="font-semibold text-ink-900">r/{thread.subreddit}</span>}
            {lead && (
              <>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{lead.num_comments} {lead.num_comments === 1 ? 'comment' : 'comments'}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">{lead.score} {lead.score === 1 ? 'upvote' : 'upvotes'}</span>
              </>
            )}
          </div>

          <h2 className="mt-1 font-play text-[18px] font-bold leading-[1.25] tracking-[-0.01em] text-ink-900">
            <a href={thread.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {thread.title}
            </a>
          </h2>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5" aria-label="Engines citing this thread">
            {thread.engines.map((e) => (
              <span
                key={e.engine}
                title={e.named > 0 ? `${engineLabel(e.engine)} named you in ${e.named} of ${e.cited} answers citing this` : `${engineLabel(e.engine)} cited this in ${e.cited} ${e.cited === 1 ? 'answer' : 'answers'}`}
                className="inline-flex h-6 items-center gap-1.5 rounded-full border-2 border-[#1c1917] bg-white px-2 text-[11.5px] font-semibold text-ink-900"
              >
                {e.named > 0 && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#059669]" />}
                {engineLabel(e.engine)}
              </span>
            ))}
            <span className="ml-1 text-[12.5px] text-ink-600">
              {named > 0
                ? <><span className="font-semibold text-[#059669]">Named in {named} of {cited}</span> answers citing it</>
                : <>Not named in any of {cited} {cited === 1 ? 'answer' : 'answers'} citing it</>}
            </span>
          </div>

          <ul className="mt-2.5 space-y-1" aria-label="Buying questions this thread answers">
            {thread.questions.map((q) => (
              <li key={q.id} className="flex items-start gap-2 text-[13.5px] leading-[1.5] text-ink-600">
                <MessageSquare className="mt-[3px] h-3.5 w-3.5 shrink-0 text-ink-300" aria-hidden="true" />
                <span>
                  <span className="text-ink-900">{q.text}</span>
                  <span className="text-ink-400"> · {q.engines.map(engineLabel).join(', ')}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {lead ? (
              <Link
                href={lead.draft_reply ? `/mentions/${projectId}/replies?lead=${lead.id}` : `/mentions/${projectId}?lead=${lead.id}`}
                className={BTN_PRIMARY}
              >
                {lead.draft_reply ? <Check className="h-4 w-4" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                {lead.draft_reply ? 'Open the draft' : 'Draft a reply'}
              </Link>
            ) : (
              <button type="button" onClick={addToLeads} disabled={importing} className={BTN_SECONDARY}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                {importing ? 'Adding' : 'Add to my leads'}
              </button>
            )}
            <a href={thread.url} target="_blank" rel="noopener noreferrer" className={BTN_QUIET}>
              Open on Reddit
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}
