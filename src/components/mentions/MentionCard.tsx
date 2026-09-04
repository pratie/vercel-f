'use client';

import { useId, useState } from 'react';
import {
  ArrowUpRight, Copy, Edit3, Loader2, Sparkles, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Mention, highlightKeywordsSafe, intentLabel,
  isHighIntent, isUnscored, relativeTime,
} from '@/lib/mentions';

interface MentionCardProps {
  mention: Mention;
  viewed: boolean;
  publishedUrl?: string;
  onViewed: (id: number) => void;
  /** Marks the lead as replied in local triage state. */
  onPublished: (id: number, commentUrl: string) => void;
}

/** Match + intent collapsed into one quiet string: "78% · Solution seeking". */
function signal(mention: Mention): string | null {
  const parts: string[] = [];
  if (!isUnscored(mention) && mention.relevance_score != null) parts.push(`${mention.relevance_score}% match`);
  if (mention.intent) parts.push(intentLabel(mention.intent));
  if (parts.length === 0 && isUnscored(mention)) return 'Not scored';
  return parts.length ? parts.join(' · ') : null;
}

/**
 * One lead, as a row in a list rather than a card. Everything that isn't
 * needed to triage (the AI explanation, the reply flow) lives behind an
 * expand so the list stays scannable.
 */
export function MentionCard({ mention, viewed, publishedUrl, onViewed, onPublished }: MentionCardProps) {
  const [reply, setReply] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const unscored = isUnscored(mention);
  const highIntent = isHighIntent(mention);
  const meta = signal(mention);
  const exactDate = new Date(mention.created_utc * 1000).toLocaleString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const text = await api.generateReply({
        title: mention.title,
        content: mention.content,
        brand_id: mention.brand_id,
      });
      setReply(text);
      setDraft(text);
      setEditing(true);
    } catch (error) {
      toast.error('Failed to generate reply', {
        description: error instanceof Error ? error.message : 'Please try again.',
        action: { label: 'Retry', onClick: handleGenerate },
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyAndOpen = async () => {
    if (!reply) return;
    try {
      await navigator.clipboard.writeText(reply);
      window.open(mention.url, '_blank', 'noopener,noreferrer');
      onViewed(mention.id);
      toast.success('Reply copied. Paste it on Reddit');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <article
      className={`group relative border-b border-black/[0.06] transition-colors duration-200
        ${expanded ? 'bg-[#fcfbf9]' : 'hover:bg-[#fcfbf9]'}
        ${viewed && !publishedUrl && !expanded ? 'opacity-65 hover:opacity-100 focus-within:opacity-100' : ''}`}
    >
      {/* Hot lead: one thin rule, nothing louder */}
      {highIntent && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 w-px bg-emerald-500"
        />
      )}

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="w-full text-left pl-4 pr-[76px] sm:pr-24 py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/25 rounded-sm"
      >
        <h3
          className="text-[15px] font-medium text-ink-900 leading-[1.45] tracking-[-0.011em]"
          style={{ textWrap: 'pretty' } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: highlightKeywordsSafe(mention.title, mention.matching_keywords) }}
        />

        {mention.content && (
          <p className="mt-1 text-[13px] text-ink-400 leading-relaxed line-clamp-1">
            {mention.content}
          </p>
        )}

        <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-ink-400 tabular-nums">
          {highIntent && (
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              High intent
            </span>
          )}
          {highIntent && <span aria-hidden="true" className="text-ink-300">·</span>}
          <span className="text-ink-600">r/{mention.subreddit}</span>
          <span aria-hidden="true" className="text-ink-300">·</span>
          <time title={exactDate}>{relativeTime(mention.created_utc)}</time>
          <span aria-hidden="true" className="text-ink-300">·</span>
          <span>{mention.num_comments} comments</span>
          <span aria-hidden="true" className="text-ink-300">·</span>
          <span>{mention.score} upvotes</span>
          {meta && (
            <>
              <span aria-hidden="true" className="text-ink-300">·</span>
              <span className={unscored ? 'text-ink-300' : 'text-ink-600'}>{meta}</span>
            </>
          )}
          {publishedUrl && (
            <>
              <span aria-hidden="true" className="text-ink-300">·</span>
              <span className="text-emerald-700">Replied</span>
            </>
          )}
        </p>
      </button>

      {/* Open on Reddit. Quiet until the row is hovered or focused. */}
      <a
        href={mention.url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onViewed(mention.id)}
        className="absolute right-3 top-3.5 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11.5px] font-medium text-ink-400
          transition-opacity duration-200 hover:text-[#d94100] focus:opacity-100
          sm:opacity-0 sm:group-hover:opacity-100
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/25"
      >
        {viewed ? 'Viewed' : 'Open'}
        <ArrowUpRight className="h-3 w-3" />
      </a>

      <div id={panelId} hidden={!expanded} className="pl-4 pr-4 pb-5 -mt-1">
        {mention.explanation && (
          <p className="max-w-[62ch] text-[13px] text-ink-600 leading-[1.7]">
            <span className="text-ink-400">Why this lead. </span>
            {mention.explanation}
          </p>
        )}

        {mention.matching_keywords.length > 0 && (
          <p className="mt-2 text-[11.5px] text-ink-400">
            Matched {mention.matching_keywords.join(', ')}
          </p>
        )}

        {reply === null ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#ff4500] text-[12.5px] font-medium text-white
                transition-opacity hover:opacity-90 disabled:opacity-50
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/30 focus-visible:ring-offset-2"
            >
              {generating ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Drafting</>
              ) : (
                <><Sparkles className="h-3.5 w-3.5" /> Draft a reply</>
              )}
            </button>
            <a
              href={mention.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onViewed(mention.id)}
              className="inline-flex items-center gap-1 h-9 px-3 rounded-lg text-[12.5px] font-medium text-ink-600 hover:text-ink-900 transition-colors"
            >
              Open on Reddit
              <ArrowUpRight className="h-3 w-3" />
            </a>
            {publishedUrl && (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 h-9 px-2 text-[12.5px] font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                View your reply
                <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>
        ) : (
          <div className="mt-4 max-w-[62ch] rounded-xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between px-4 h-10 border-b border-black/[0.06]">
              <span className="text-[11px] font-medium uppercase tracking-[0.09em] text-ink-400">Your reply</span>
              <button
                className="text-ink-400 hover:text-ink-900 transition-colors min-hit-area"
                onClick={() => { setReply(null); setEditing(false); }}
                aria-label="Discard reply"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4">
              {editing ? (
                <div className="space-y-2.5">
                  <textarea
                    autoFocus
                    className="w-full rounded-lg bg-[#fcfbf9] p-3 text-[13px] leading-relaxed text-ink-700 shadow-[0_0_0_1px_rgba(0,0,0,0.07)]
                      resize-none focus:outline-none focus:shadow-[0_0_0_1px_rgba(255,69,0,0.4)] transition-shadow"
                    rows={5}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setDraft(reply); setEditing(false); }}
                      className="h-8 px-3 rounded-lg text-xs font-medium text-ink-600 hover:text-ink-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setReply(draft || reply); setEditing(false); }}
                      className="h-8 px-3.5 rounded-lg bg-[#ff4500] text-xs font-medium text-white hover:opacity-90 transition-opacity"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-[13px] text-ink-700 leading-[1.7] whitespace-pre-wrap cursor-text rounded-lg p-1.5 -m-1.5 hover:bg-[#fcfbf9] transition-colors"
                  onClick={() => { setDraft(reply); setEditing(true); }}
                  title="Click to edit"
                >
                  {reply}
                </p>
              )}
            </div>

            {!editing && (
              <div className="flex flex-wrap items-center gap-1 px-3 h-11 border-t border-black/[0.06]">
                <button
                  onClick={copyAndOpen}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium text-ink-600 hover:text-ink-900 hover:bg-[#f7f6f4] transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy and open
                </button>
                <button
                  onClick={() => { setDraft(reply); setEditing(true); }}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium text-ink-600 hover:text-ink-900 hover:bg-[#f7f6f4] transition-colors"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    onPublished(mention.id, mention.url);
                    toast.success('Marked as replied');
                  }}
                  disabled={!!publishedUrl}
                  className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[12px] font-medium transition-colors ${
                    publishedUrl
                      ? 'text-emerald-700'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-[#f7f6f4]'
                  }`}
                  title="Posted it on Reddit? Mark it done so it moves to your Replied tab"
                >
                  {publishedUrl ? 'Replied' : 'Mark as replied'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
