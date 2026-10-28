'use client';

import { useState } from 'react';
import {
  Bot, Loader2, MessageSquare, Plus, Search, Sparkles, Swords, X,
} from 'lucide-react';
import { VisibilityCompetitor, VisibilityPrompt } from '@/lib/api';
import { BTN_PRIMARY, BTN_SECONDARY, FIELD, PANEL, STICKER_PANEL } from '@/components/ui/sticker';

interface SetupPanelProps {
  /** `onboarding` shows the full pitch. `manage` is the compact editor used once results exist. */
  variant: 'onboarding' | 'manage';
  brandName: string;
  prompts: VisibilityPrompt[];
  competitors: VisibilityCompetitor[];
  suggestedPrompts: string[];
  onAddPrompt: (text: string) => Promise<boolean>;
  onRemovePrompt: (id: number) => Promise<void>;
  onAddCompetitor: (name: string) => Promise<boolean>;
  onRemoveCompetitor: (id: number) => Promise<void>;
  onRun: () => void;
  running: boolean;
}

function StepHeading({ step, icon: Icon, title, sub }: {
  /** Empty in the compact `manage` variant, which isn't a numbered flow. */
  step?: string;
  icon: React.ElementType;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-3.5 flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff4500]/[0.12] text-[#b83200]">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="font-play text-[17px] font-bold leading-tight tracking-[-0.01em] text-ink-900">
          {step && <span className="mr-1.5 text-[#b83200]">{step}</span>}
          {title}
        </h3>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ink-400">{sub}</p>
      </div>
    </div>
  );
}

export function SetupPanel({
  variant, brandName, prompts, competitors, suggestedPrompts,
  onAddPrompt, onRemovePrompt, onAddCompetitor, onRemoveCompetitor, onRun, running,
}: SetupPanelProps) {
  const [promptDraft, setPromptDraft] = useState('');
  const [competitorDraft, setCompetitorDraft] = useState('');
  const [addingPrompt, setAddingPrompt] = useState(false);
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<string | null>(null);
  // Keyed by kind, because a prompt and a competitor can share an id.
  const [removing, setRemoving] = useState<Set<string>>(new Set());

  const onboarding = variant === 'onboarding';
  const taken = new Set(prompts.map((p) => p.text.trim().toLowerCase()));
  const unusedSuggestions = suggestedPrompts.filter((s) => !taken.has(s.trim().toLowerCase()));

  const markRemoving = (key: string, on: boolean) => {
    setRemoving((prev) => {
      const next = new Set(prev);
      if (on) next.add(key); else next.delete(key);
      return next;
    });
  };

  const submitPrompt = async () => {
    const text = promptDraft.trim();
    if (!text || addingPrompt) return;
    setAddingPrompt(true);
    const ok = await onAddPrompt(text);
    if (ok) setPromptDraft('');
    setAddingPrompt(false);
  };

  const submitSuggestion = async (text: string) => {
    if (pendingSuggestion) return;
    setPendingSuggestion(text);
    await onAddPrompt(text);
    setPendingSuggestion(null);
  };

  const submitCompetitor = async () => {
    const name = competitorDraft.trim();
    if (!name || addingCompetitor) return;
    setAddingCompetitor(true);
    const ok = await onAddCompetitor(name);
    if (ok) setCompetitorDraft('');
    setAddingCompetitor(false);
  };

  const removePrompt = async (id: number) => {
    markRemoving(`p${id}`, true);
    await onRemovePrompt(id);
    markRemoving(`p${id}`, false);
  };

  const removeCompetitor = async (id: number) => {
    markRemoving(`c${id}`, true);
    await onRemoveCompetitor(id);
    markRemoving(`c${id}`, false);
  };

  return (
    <div className={onboarding ? STICKER_PANEL : PANEL}>
      <div className={onboarding ? 'p-6 sm:p-8' : 'p-5'}>
        {onboarding && (
          <div className="mb-7 max-w-2xl">
            <h2 className="font-play text-[26px] font-extrabold leading-[1.1] tracking-[-0.02em] text-ink-900 sm:text-[30px]">
              When a buyer asks AI which tool to use, does it say{' '}
              <span className="text-[#d13800]">{brandName || 'your product'}</span>?
            </h2>
            <p className="mt-2.5 text-[13.5px] text-ink-600 leading-relaxed">
              This measures how often ChatGPT, Gemini, Perplexity and Claude name you instead of a competitor,
              because that answer is now the shortlist your buyers start from.
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
              {[
                { icon: MessageSquare, title: 'Ask the real questions', body: 'The buying questions your customers type, not vanity keywords.' },
                { icon: Bot, title: 'Across four models', body: 'Every question, every assistant, scored the same way each run.' },
                { icon: Search, title: 'Then close the gap', body: 'We surface the Reddit threads those models read, so you can join them.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-cream px-3.5 py-3">
                  <item.icon className="mb-1.5 h-3.5 w-3.5 text-[#b83200]" aria-hidden="true" />
                  <p className="text-[13px] font-semibold leading-snug text-ink-900">{item.title}</p>
                  <p className="mt-0.5 text-[12px] leading-snug text-ink-600">{item.body}</p>
                </div>
              ))}
            </div>

            {/* The same disclosure the results screen carries, shown before they run. */}
            <p className="mt-3 text-[11.5px] text-ink-400 leading-snug">
              We ask each model directly with live web search enabled. Results can differ slightly from the consumer apps.
            </p>
          </div>
        )}

        {/* ── Questions ── */}
        <StepHeading
          step={onboarding ? '1.' : ''}
          icon={MessageSquare}
          title={onboarding ? 'Pick the questions your buyers ask' : 'Tracked questions'}
          sub={
            onboarding
              ? 'Add a few. Three to eight works well. You can change them any time.'
              : 'Changes apply on your next check.'
          }
        />

        {prompts.length > 0 && (
          <ul className="space-y-1.5 mb-3.5">
            {prompts.map((prompt) => (
              <li
                key={prompt.id}
                className="flex items-start gap-2.5 rounded-xl bg-cream px-3.5 py-2.5"
              >
                <MessageSquare className="h-3.5 w-3.5 text-ink-400 shrink-0 mt-px" />
                <span className="flex-1 text-[13px] text-ink-700 leading-snug">{prompt.text}</span>
                <button
                  onClick={() => removePrompt(prompt.id)}
                  disabled={removing.has(`p${prompt.id}`)}
                  className="text-ink-300 hover:text-ink-700 transition-colors shrink-0 min-hit-area disabled:opacity-40"
                  aria-label={`Remove question: ${prompt.text}`}
                >
                  {removing.has(`p${prompt.id}`)
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <X className="h-3.5 w-3.5" />}
                </button>
              </li>
            ))}
          </ul>
        )}

        {unusedSuggestions.length > 0 && (
          <div className="mb-3.5">
            <p className="mb-2 text-[12.5px] font-semibold text-ink-600">
              Suggested for {brandName || 'your product'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unusedSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => submitSuggestion(suggestion)}
                  disabled={pendingSuggestion !== null}
                  className="inline-flex max-w-full items-start gap-1.5 rounded-full border-2 border-[#1c1917]/[0.12] bg-white px-3 py-1.5 text-left text-[12.5px] font-medium leading-snug text-ink-700 transition-colors hover:border-[#1c1917] hover:text-ink-900 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                >
                  {pendingSuggestion === suggestion
                    ? <Loader2 className="h-3 w-3 animate-spin shrink-0 mt-0.5" />
                    : <Plus className="h-3 w-3 shrink-0 mt-0.5" />}
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <input
            value={promptDraft}
            onChange={(e) => setPromptDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitPrompt(); } }}
            placeholder="e.g. best tool for tracking Reddit mentions"
            aria-label="Add a question"
            className={`${FIELD} min-w-0 flex-1`}
          />
          <button
            onClick={submitPrompt}
            disabled={!promptDraft.trim() || addingPrompt}
            className={`${BTN_SECONDARY} shrink-0`}
          >
            {addingPrompt ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Add
          </button>
        </div>

        {/* ── Competitors ── */}
        <div className="mt-7">
          <StepHeading
            step={onboarding ? '2.' : ''}
            icon={Swords}
            title={onboarding ? 'Name who you are up against' : 'Competitors'}
            sub="Optional. We score them on the same answers so you can see the gap."
          />

          {competitors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {competitors.map((competitor) => (
                <span key={competitor.id} className="chip border-2 border-[#1c1917]/[0.12] bg-white text-ink-700">
                  {competitor.name}
                  <button
                    onClick={() => removeCompetitor(competitor.id)}
                    disabled={removing.has(`c${competitor.id}`)}
                    className="text-ink-300 hover:text-ink-700 transition-colors disabled:opacity-40"
                    aria-label={`Remove competitor ${competitor.name}`}
                  >
                    {removing.has(`c${competitor.id}`)
                      ? <Loader2 className="h-3 w-3 animate-spin" />
                      : <X className="h-3 w-3" />}
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              value={competitorDraft}
              onChange={(e) => setCompetitorDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submitCompetitor(); } }}
              placeholder="Competitor name"
              aria-label="Add a competitor"
              className={`${FIELD} min-w-0 flex-1`}
            />
            <button
              onClick={submitCompetitor}
              disabled={!competitorDraft.trim() || addingCompetitor}
              className={`${BTN_SECONDARY} shrink-0`}
            >
              {addingCompetitor ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </button>
          </div>
        </div>

        {onboarding && (
          <div className="mt-7 flex flex-wrap items-center gap-3 border-t-2 border-[#1c1917]/[0.08] pt-6">
            <button onClick={onRun} disabled={prompts.length === 0 || running} className={BTN_PRIMARY}>
              {running ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              {running ? 'Checking' : 'Check AI visibility'}
            </button>
            <p className="text-[12.5px] leading-snug text-ink-600">
              {prompts.length === 0
                ? 'Add at least one question to run your first check.'
                : `We will ask ${prompts.length} question${prompts.length === 1 ? '' : 's'} across 4 assistants. Takes about a minute.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
