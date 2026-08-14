'use client';

import { useState } from 'react';
import {
  ArrowUpRight, Calendar, CheckCircle, Copy, Edit3, Loader2,
  MessageSquare, Sparkles, X, ArrowBigUp, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  Mention, highlightKeywordsSafe, intentLabel, intentTone,
  isHighIntent, isUnscored, relativeTime, scoreTier,
} from '@/lib/mentions';

interface MentionCardProps {
  mention: Mention;
  viewed: boolean;
  publishedUrl?: string;
  onViewed: (id: number) => void;
  /** Marks the lead as replied in local triage state. */
  onPublished: (id: number, commentUrl: string) => void;
}

export function MentionCard({ mention, viewed, publishedUrl, onViewed, onPublished }: MentionCardProps) {
  const [reply, setReply] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const unscored = isUnscored(mention);
  const highIntent = isHighIntent(mention);
  const tone = intentTone(mention.intent);
  const tier = scoreTier(mention);
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
    <div
      className={`bg-white rounded-2xl overflow-hidden transition-[box-shadow,transform,opacity] duration-300 ease-out
        ${highIntent ? 'shadow-[0_1px_3px_rgba(255,69,0,0.12),0_0_0_1px_rgba(255,69,0,0.14),0_8px_20px_-8px_rgba(255,69,0,0.12)]' : 'shadow-card'}
        ${viewed && !publishedUrl ? 'opacity-60 hover:opacity-100' : ''}
        hover:shadow-card-hover hover:-translate-y-px`}
    >
      {highIntent && <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300" />}

      <div className="p-4 sm:p-5">
        {/* Chips row */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <span className="chip bg-orange-50 text-orange-700">
            r/{mention.subreddit}
          </span>

          {highIntent && (
            <span className="chip bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_2px_6px_-1px_rgba(255,69,0,0.4)]" title="Strong buying or solution-seeking signal. Reply to this one first">
              <Zap className="h-3 w-3 fill-current" />
              Hot lead
            </span>
          )}

          <span
            className={`chip tabular-nums ${tier.chip}`}
            title={unscored ? 'This lead hasn’t been AI-scored yet. Use “Score leads” above to fix that.' : 'How closely this conversation matches your product, scored by AI'}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
            {unscored ? tier.label : `${mention.relevance_score}% · ${tier.label}`}
          </span>

          {mention.intent && (
            <span className={`chip border ${tone.chip}`}>
              {intentLabel(mention.intent)}
            </span>
          )}

          {publishedUrl && (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="chip bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle className="h-3 w-3" />
              Replied
            </a>
          )}

          <a
            href={mention.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onViewed(mention.id)}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-ink-600 bg-cream hover:bg-orange-50 hover:text-orange-700 transition-colors min-hit-area"
          >
            {viewed ? 'Viewed' : 'Open'}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-ink-900 leading-snug mb-1.5 tracking-[-0.01em]" style={{ textWrap: 'pretty' } as React.CSSProperties}>
          <a
            href={mention.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onViewed(mention.id)}
            className="hover:text-orange-700 transition-colors"
            dangerouslySetInnerHTML={{ __html: highlightKeywordsSafe(mention.title, mention.matching_keywords) }}
          />
        </h3>

        {/* Post body preview */}
        {mention.content && (
          <p className="text-[13px] text-ink-600 leading-relaxed line-clamp-2 mb-2.5">
            {mention.content}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-ink-400 mb-3">
          <span className="flex items-center gap-1" title={exactDate}>
            <Calendar className="h-3 w-3" />
            {relativeTime(mention.created_utc)}
          </span>
          <span className="flex items-center gap-1 tabular-nums" title="Upvotes">
            <ArrowBigUp className="h-3.5 w-3.5" />
            {mention.score}
          </span>
          <span className="flex items-center gap-1 tabular-nums" title="Comments">
            <MessageSquare className="h-3 w-3" />
            {mention.num_comments}
          </span>
          {mention.matching_keywords.length > 0 && (
            <span className="flex flex-wrap items-center gap-1">
              {mention.matching_keywords.map((k) => (
                <span key={k} className="px-1.5 py-px rounded bg-cream text-ink-600 text-[10.5px] font-medium">
                  {k}
                </span>
              ))}
            </span>
          )}
        </div>

        {/* Why this matters (AI explanation) */}
        {mention.explanation && (
          <div className="mb-3 rounded-xl bg-[#fdf9f3] border border-[#f3ead9] px-3.5 py-2.5 text-[12.5px] text-ink-700 leading-relaxed">
            <span className="font-semibold text-orange-700/80 mr-1">
              <Sparkles className="h-3 w-3 inline -mt-px mr-1" />
              Why this lead:
            </span>
            {showWhy || mention.explanation.length <= 140
              ? mention.explanation
              : `${mention.explanation.substring(0, 140)}…`}
            {mention.explanation.length > 140 && (
              <button onClick={() => setShowWhy(!showWhy)} className="text-orange-600 hover:text-orange-700 ml-1 font-semibold">
                {showWhy ? 'less' : 'more'}
              </button>
            )}
          </div>
        )}

        {/* Reply flow */}
        {reply === null ? (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-orange-50 text-[12.5px] font-semibold text-orange-700 hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            {generating ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Drafting…</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> Draft a reply</>
            )}
          </button>
        ) : (
          <div className="mt-3 rounded-xl overflow-hidden bg-[#fffaf6] shadow-[0_0_0_1px_rgba(255,110,40,0.14),0_1px_3px_rgba(120,60,20,0.05)]">
            <div className="px-4 py-2.5 border-b border-orange-100/70 flex items-center justify-between">
              <span className="text-[11px] font-bold text-orange-700/70 uppercase tracking-wider">Your reply</span>
              <button className="text-ink-400 hover:text-ink-700 p-0.5 min-hit-area" onClick={() => { setReply(null); setEditing(false); }} aria-label="Discard reply">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4">
              {editing ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    className="w-full border border-orange-200/60 rounded-xl p-3 text-[13px] text-ink-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/15 focus:border-orange-300 transition-[border-color,box-shadow] resize-none leading-relaxed"
                    rows={4}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setDraft(reply); setEditing(false); }}
                      className="text-xs h-8 px-3.5 rounded-lg bg-white text-ink-600 shadow-card hover:bg-cream transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setReply(draft || reply); setEditing(false); }}
                      className="text-xs h-8 px-3.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-orange transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-[13px] text-ink-700 leading-relaxed whitespace-pre-wrap cursor-text hover:bg-white rounded-lg p-1.5 -m-1.5 transition-colors"
                  onClick={() => { setDraft(reply); setEditing(true); }}
                  title="Click to edit"
                >
                  {reply}
                </p>
              )}
            </div>

            {!editing && (
              <div className="px-4 py-2.5 border-t border-orange-100/70 flex items-center gap-2 flex-wrap">
                <button
                  onClick={copyAndOpen}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white text-[11.5px] font-semibold text-ink-600 shadow-card hover:bg-cream transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy & Open
                </button>
                <button
                  onClick={() => { setDraft(reply); setEditing(true); }}
                  className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white text-[11.5px] font-semibold text-ink-600 shadow-card hover:bg-cream transition-colors"
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
                  className={`flex items-center gap-1.5 px-3.5 h-8 rounded-lg text-[11.5px] font-bold transition-colors ${
                    publishedUrl
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                  title="Posted it on Reddit? Mark it done so it moves to your Replied tab"
                >
                  <CheckCircle className="h-3 w-3" />
                  {publishedUrl ? 'Replied' : 'Mark as replied'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
