'use client';

// The project's DM template, edited next to the DM queue. When a template is
// set, every DM draft follows its structure and the model fills the
// variables. The preview shows the template against a real lead: the parts we
// know (username, title, product) filled in, the parts the model writes marked.

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Mention } from '@/lib/mentions';
import { BTN_PRIMARY, BTN_QUIET, BTN_SECONDARY, PANEL } from '@/components/ui/sticker';
import { cleanRedditText } from './MentionCard';

const MAX = 1500;

const VARIABLES: { key: string; label: string }[] = [
  { key: 'first_name_or_username', label: 'Their name' },
  { key: 'post_title', label: 'Post title' },
  { key: 'their_problem', label: 'Their problem' },
  { key: 'product_name', label: 'Product name' },
  { key: 'product_benefit', label: 'Product benefit' },
];

const EXAMPLE =
  'Hey {first_name_or_username}, saw your post "{post_title}". {their_problem} is the exact reason I built {product_name}. ' +
  'It {product_benefit}. Want me to send a short walkthrough?';

function renderPreview(template: string, known: Record<string, string>, guessed: Record<string, string>): ReactNode[] {
  return template.split(/(\{[a-z_]+\})/g).map((part, i) => {
    const m = part.match(/^\{([a-z_]+)\}$/);
    if (!m) return <Fragment key={i}>{part}</Fragment>;
    const name = m[1];
    if (known[name] != null) return <span key={i} className="font-semibold text-ink-900">{known[name]}</span>;
    if (guessed[name] != null) {
      return (
        <span key={i} className="rounded bg-[#fff1eb] px-1 text-[#b83200]" title="Written for each lead when the message is drafted">
          {guessed[name]}
        </span>
      );
    }
    return <span key={i} className="rounded bg-[#fef2f2] px-1 text-[#b91c1c]" title="Not a known variable">{part}</span>;
  });
}

interface Props {
  projectId: string;
  productName?: string;
  /** Leads to preview with, best first. */
  leads: Mention[];
}

export function DmTemplatePanel({ projectId, productName, leads }: Props) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [sample, setSample] = useState<string | null>(null);
  const [sampling, setSampling] = useState(false);
  const area = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    api.getInstructions(projectId)
      .then((r) => { if (!cancelled) { setSaved(r.dm_template); setValue(r.dm_template); } })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, [projectId]);

  const withAuthor = leads.filter((m) => m.author && m.author !== 'unknown' && m.author !== '[deleted]');
  const lead = withAuthor.find((m) => m.id === leadId) ?? withAuthor[0] ?? null;
  const dirty = saved !== null && value !== saved;
  const unknownVars = Array.from(value.matchAll(/\{([a-z_]+)\}/g))
    .map((m) => m[1])
    .filter((v) => !VARIABLES.some((x) => x.key === v));

  const insert = (key: string) => {
    const el = area.current;
    const token = `{${key}}`;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = (value.slice(0, start) + token + value.slice(end)).slice(0, MAX);
    setValue(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const save = async (next: string) => {
    setSaving(true);
    try {
      const r = await api.saveInstructions(projectId, { dm_template: next });
      setSaved(r.dm_template);
      setValue(r.dm_template);
      toast.success(r.dm_template ? 'Template saved. New DM drafts follow it' : 'Template removed. DMs are drafted freely again');
    } catch (e) {
      toast.error('Could not save the template', { description: e instanceof Error ? e.message : 'Check your connection and try again.' });
    } finally {
      setSaving(false);
    }
  };

  const tryIt = async () => {
    if (!lead || sampling || !value.trim()) return;
    setSampling(true);
    try {
      setSample((await api.previewDmTemplate(projectId, lead.id, value)).message);
    } catch (e) {
      toast.error('Could not draft a preview', { description: e instanceof Error ? e.message : 'Please try again.' });
    } finally {
      setSampling(false);
    }
  };

  const product = productName || 'your product';
  const known: Record<string, string> = {
    first_name_or_username: lead ? lead.author : 'their_username',
    post_title: lead ? cleanRedditText(lead.title) : 'their post title',
    product_name: product,
  };
  const guessed: Record<string, string> = {
    their_problem: 'their problem, in a few words',
    product_benefit: `how ${product} helps with it`,
  };

  const status = saved === null ? (loadError ? 'Could not load' : 'Loading') : saved ? 'On' : 'Off';

  return (
    <section className={`${PANEL} mb-5`} aria-labelledby="dm-template-heading">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="dm-template-body"
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ff4500]/40 sm:px-5"
      >
        <span className="min-w-0 flex-1">
          <span id="dm-template-heading" className="block text-[14px] font-semibold text-ink-900">
            DM template
            <span className={`ml-2 text-[12.5px] font-semibold ${saved ? 'text-[#047857]' : 'text-ink-400'}`}>{status}</span>
          </span>
          <span className="mt-0.5 block text-[12.5px] text-ink-400">
            {saved ? 'Every DM draft follows your structure. The details are written for each lead.' : 'Optional. Give your DMs a fixed structure and keep the wording you like.'}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-400 transition-transform duration-150 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>

      <div id="dm-template-body" hidden={!open} className="border-t-2 border-[#1c1917]/[0.06] px-4 pb-5 pt-4 sm:px-5">
        {loadError ? (
          <p role="alert" className="text-[13px] text-[#b83200]">Could not load your template. Reload the page to try again.</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor="dm-template" className="text-[13px] font-semibold text-ink-900">Template</label>
                <span className={`text-[11.5px] tabular-nums ${value.length > MAX * 0.9 ? 'font-semibold text-[#b45309]' : 'text-ink-400'}`}>
                  {value.length.toLocaleString()} / {MAX.toLocaleString()}
                </span>
              </div>
              <textarea
                id="dm-template"
                ref={area}
                value={value}
                onChange={(e) => { setValue(e.target.value.slice(0, MAX)); setSample(null); }}
                maxLength={MAX}
                rows={6}
                disabled={saved === null || saving}
                placeholder={`Example: ${EXAMPLE}`}
                className="mt-1.5 w-full resize-y rounded-xl border-2 border-[#1c1917]/[0.12] bg-white p-3 text-[13.5px] leading-relaxed text-ink-900 placeholder:text-ink-300 transition-colors focus:border-[#1c1917] focus:outline-none disabled:opacity-50"
              />
              <p className="mt-2 text-[12px] text-ink-400">Insert a variable</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => insert(v.key)}
                    disabled={saved === null || saving}
                    title={`{${v.key}}`}
                    className="h-8 rounded-lg border-2 border-[#1c1917]/[0.12] bg-white px-2.5 text-[12.5px] font-medium text-ink-700 transition-colors hover:border-[#1c1917]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40 disabled:opacity-50"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
              {unknownVars.length > 0 && (
                <p className="mt-2 text-[12px] text-[#b91c1c]">
                  {unknownVars.map((v) => `{${v}}`).join(', ')} {unknownVars.length === 1 ? 'is not a variable' : 'are not variables'}. Use the buttons above.
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button onClick={() => save(value)} disabled={!dirty || saving} className={BTN_PRIMARY}>
                  {saving && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
                  Save template
                </button>
                {!value && !saved && (
                  <button onClick={() => setValue(EXAMPLE)} className={BTN_QUIET}>Start from the example</button>
                )}
                {saved && (
                  <button onClick={() => save('')} disabled={saving} className={BTN_QUIET}>Remove template</button>
                )}
                {dirty && <span className="text-[12px] text-ink-400">Unsaved changes</span>}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[13px] font-semibold text-ink-900">Preview</p>
                {withAuthor.length > 1 && (
                  <label className="flex min-w-0 items-center gap-1.5 text-[12px] text-ink-400">
                    <span className="shrink-0">With</span>
                    <select
                      value={lead?.id ?? ''}
                      onChange={(e) => { setLeadId(Number(e.target.value)); setSample(null); }}
                      className="h-8 min-w-0 max-w-[220px] truncate rounded-lg border-2 border-[#1c1917]/[0.12] bg-white px-2 text-[12.5px] text-ink-700 focus:border-[#1c1917] focus:outline-none"
                    >
                      {withAuthor.slice(0, 25).map((m) => (
                        <option key={m.id} value={m.id}>u/{m.author}: {cleanRedditText(m.title).slice(0, 48)}</option>
                      ))}
                    </select>
                  </label>
                )}
              </div>
              <div className="mt-1.5 min-h-[148px] rounded-xl border-2 border-[#1c1917]/[0.08] bg-[#fcfbf9] p-3">
                {value.trim() ? (
                  <>
                    <p className="text-[11.5px] font-semibold text-ink-400">Message to u/{known.first_name_or_username}</p>
                    <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-[1.7] text-ink-700">
                      {renderPreview(value, known, guessed)}
                    </p>
                  </>
                ) : (
                  <p className="text-[13px] leading-relaxed text-ink-400">Write a template on the left to see it here. Without one, each DM is drafted freely.</p>
                )}
              </div>
              <p className="mt-1.5 text-[11.5px] text-ink-400">
                <span className="rounded bg-[#fff1eb] px-1 text-[#b83200]">Marked parts</span> are written for each lead.
              </p>

              {lead && value.trim() && (
                <div className="mt-3">
                  <button onClick={tryIt} disabled={sampling} className={BTN_SECONDARY}>
                    {sampling ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                    {sampling ? 'Drafting' : `Draft one for u/${lead.author}`}
                  </button>
                  {sample && (
                    <div className="mt-3 rounded-xl border-2 border-[#1c1917]/[0.12] bg-white p-3">
                      <p className="text-[11.5px] font-semibold text-ink-400">Real draft, not saved</p>
                      <p className="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-[1.7] text-ink-700">{sample}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
