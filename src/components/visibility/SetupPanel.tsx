'use client';

import { useState } from 'react';
import {
  Bot, Loader2, MessageSquare, Plus, Search, Sparkles, Swords, X,
} from 'lucide-react';
import { VisibilityCompetitor, VisibilityPrompt } from '@/lib/api';

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
    <div className="flex items-start gap-3 mb-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[13.5px] font-bold text-ink-900 leading-tight">
          {step && <span className="text-orange-600 mr-1.5">{step}</span>}
          {title}
        </p>
        <p className="text-[12px] text-ink-400 leading-snug mt-0.5">{sub}</p>
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
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {onboarding && <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300" />}

      <div className={onboarding ? 'p-6 sm:p-8' : 'p-5'}>
        {onboarding && (
          <div className="mb-7 max-w-2xl">
            <span className="chip bg-orange-50 text-orange-700">
              <Sparkles className="h-3 w-3" />
              AI Visibility
            </span>
            <h2 className="mt-3 text-[24px] sm:text-[28px] font-bold text-ink-900 tracking-tight leading-[1.15]">
              When a buyer asks AI which tool to use, does it say{' '}
              <span className="text-orange-600">{brandName || 'your product'}</span>?
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
                <div key={item.title} className="rounded-xl bg-[#fdf9f3] px-3.5 py-3">
                  <item.icon className="h-3.5 w-3.5 text-orange-600 mb-1.5" />
                  <p className="text-[12.5px] font-semibold text-ink-900 leading-snug">{item.title}</p>
                  <p className="text-[11.5px] text-ink-400 leading-snug mt-0.5">{item.body}</p>
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
                className="flex items-start gap-2.5 rounded-xl bg-cream/70 px-3.5 py-2.5"
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
            <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-400 mb-2">
              Suggested for {brandName || 'your product'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {unusedSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => submitSuggestion(suggestion)}
                  disabled={pendingSuggestion !== null}
                  className="inline-flex items-start gap-1.5 max-w-full rounded-full bg-cream px-3 py-1.5 text-left text-[12.5px] font-medium leading-snug text-ink-700 hover:bg-orange-50 hover:text-orange-700 transition-colors disabled:opacity-50"
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
            className="flex-1 min-w-0 h-10 rounded-xl bg-white px-3.5 text-[13px] text-ink-700 placeholder:text-ink-300 shadow-card focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition-shadow"
          />
          <button
            onClick={submitPrompt}
            disabled={!promptDraft.trim() || addingPrompt}
            className="flex items-center gap-1.5 px-3.5 h-10 shrink-0 rounded-xl bg-white text-xs font-semibold text-ink-600 shadow-card hover:shadow-card-hover hover:text-ink-900 transition-[box-shadow,color] disabled:opacity-40"
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
                <span key={competitor.id} className="chip bg-cream text-ink-700">
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
              className="flex-1 min-w-0 h-10 rounded-xl bg-white px-3.5 text-[13px] text-ink-700 placeholder:text-ink-300 shadow-card focus:outline-none focus:ring-2 focus:ring-orange-500/15 transition-shadow"
            />
            <button
              onClick={submitCompetitor}
              disabled={!competitorDraft.trim() || addingCompetitor}
              className="flex items-center gap-1.5 px-3.5 h-10 shrink-0 rounded-xl bg-white text-xs font-semibold text-ink-600 shadow-card hover:shadow-card-hover hover:text-ink-900 transition-[box-shadow,color] disabled:opacity-40"
            >
              {addingCompetitor ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add
            </button>
          </div>
        </div>

        {onboarding && (
          <div className="mt-7 pt-6 border-t border-cream flex flex-wrap items-center gap-3">
            <button onClick={onRun} disabled={prompts.length === 0 || running} className="btn-primary text-[13px]">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {running ? 'Checking…' : 'Check AI visibility'}
            </button>
            <p className="text-[12px] text-ink-400 leading-snug">
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
