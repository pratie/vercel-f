'use client';

import { useState } from 'react';
import {
  ArrowUpRight, Calendar, CheckCircle, Copy, Edit3, Loader2,
  MessageSquare, Sparkles, Target, X, ArrowBigUp, HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useRedditAuthStore } from '@/lib/redditAuth';
import {
  Mention, highlightKeywordsSafe, intentLabel, intentTone,
  isHighIntent, isUnscored, relativeTime,
} from '@/lib/mentions';

interface MentionCardProps {
  mention: Mention;
  viewed: boolean;
  publishedUrl?: string;
  onViewed: (id: number) => void;
  onPublished: (id: number, commentUrl: string) => void;
  /** null = unknown (endpoint unavailable) — don't block on it */
  quotaRemaining: number | null;
}

function relevanceChip(score: number) {
  if (score >= 80) return { cls: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-500' };
  if (score >= 60) return { cls: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' };
  return { cls: 'bg-gray-50 text-gray-600 border-gray-100', dot: 'bg-gray-400' };
}

export function MentionCard({ mention, viewed, publishedUrl, onViewed, onPublished, quotaRemaining }: MentionCardProps) {
  const redditAuth = useRedditAuthStore();
  const [reply, setReply] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const unscored = isUnscored(mention);
  const highIntent = isHighIntent(mention);
  const tone = intentTone(mention.intent);
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

  const handlePublish = async () => {
    if (posting || !reply) return;
    if (quotaRemaining !== null && quotaRemaining <= 0) {
      toast.error('Daily reply limit reached', {
        description: 'Reddit lets you post 5 replies per 24h through SneakyGuy. Use Copy & Open for the rest.',
      });
      return;
    }
    setPosting(true);
    try {
      const result = await redditAuth.postComment({
        brand_id: mention.brand_id,
        post_url: mention.url,
        post_title: mention.title,
        comment_text: reply,
      });
      onPublished(mention.id, result.comment_url);
      toast.success(
        result.status === 'already_exists' ? 'You already replied to this post' : 'Reply posted to Reddit',
        { action: { label: 'View', onClick: () => window.open(result.comment_url, '_blank') } }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to post reply', {
        description: 'You can still use Copy & Open to reply manually.',
      });
    } finally {
      setPosting(false);
    }
  };

  const copyAndOpen = async () => {
    if (!reply) return;
    try {
      await navigator.clipboard.writeText(reply);
      window.open(mention.url, '_blank', 'noopener,noreferrer');
      onViewed(mention.id);
      toast.success('Reply copied — paste it on Reddit');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden transition-[box-shadow,transform,opacity] duration-300 ease-out
        ${highIntent ? 'shadow-[0_1px_3px_rgba(249,115,22,0.1),0_0_0_1px_rgba(249,115,22,0.12)]' : 'shadow-card'}
        ${viewed && !publishedUrl ? 'opacity-60 hover:opacity-100' : ''}
        hover:shadow-card-hover hover:-translate-y-px`}
    >
      {highIntent && <div className="h-0.5 bg-gradient-to-r from-orange-500 to-amber-400" />}

      <div className="p-4 sm:p-5">
        {/* Chips row */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">
            r/{mention.subreddit}
          </span>

          {mention.intent && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${tone.chip}`}>
              {intentLabel(mention.intent)}
            </span>
          )}

          {unscored ? (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-md border bg-gray-50 text-gray-400 border-gray-100 flex items-center gap-1"
              title="This lead hasn't been AI-scored yet. Use “Score leads” above to fix that."
            >
              <HelpCircle className="h-3 w-3" />
              Not scored
            </span>
          ) : (
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 tabular-nums ${relevanceChip(mention.relevance_score!).cls}`}
              title="How closely this conversation matches your product, scored by AI"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${relevanceChip(mention.relevance_score!).dot}`} />
              {mention.relevance_score}% match
            </span>
          )}

          {publishedUrl && (
            <a
              href={publishedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 flex items-center gap-1 hover:bg-green-100 transition-colors"
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
            className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors min-hit-area"
          >
            {viewed ? 'Viewed' : 'Open'}
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        {/* Title */}
        <h3 className="text-[13px] sm:text-sm font-medium text-gray-900 leading-snug mb-1.5" style={{ textWrap: 'pretty' } as React.CSSProperties}>
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
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-2">
            {mention.content}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mb-3">
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
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {mention.matching_keywords.map((k) => `#${k}`).join(' ')}
            </span>
          )}
        </div>

        {/* Why this matters (AI explanation) */}
        {mention.explanation && (
          <div className="text-xs text-gray-500 leading-relaxed mb-3">
            <span className="font-medium text-gray-400">Why it matters: </span>
            {showWhy || mention.explanation.length <= 140
              ? mention.explanation
              : `${mention.explanation.substring(0, 140)}…`}
            {mention.explanation.length > 140 && (
              <button onClick={() => setShowWhy(!showWhy)} className="text-orange-600 hover:text-orange-700 ml-1 font-medium">
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
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-[background-color,border-color] disabled:opacity-50"
          >
            {generating ? (
              <><Loader2 className="h-3 w-3 animate-spin" /> Drafting…</>
            ) : (
              <><Sparkles className="h-3 w-3 text-orange-500" /> Draft a reply</>
            )}
          </button>
        ) : (
          <div className="mt-3 rounded-xl overflow-hidden bg-gray-50/50 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.05)]">
            <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Your reply</span>
              <button className="text-gray-400 hover:text-gray-600 p-0.5 min-hit-area" onClick={() => { setReply(null); setEditing(false); }} aria-label="Discard reply">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4">
              {editing ? (
                <div className="space-y-2">
                  <textarea
                    autoFocus
                    className="w-full border border-gray-200 rounded-lg p-3 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-gray-300 transition-[border-color,box-shadow] resize-none"
                    rows={4}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setDraft(reply); setEditing(false); }}
                      className="text-xs h-7 px-3 rounded-md border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => { setReply(draft || reply); setEditing(false); }}
                      className="text-xs h-7 px-3 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-[0_2px_8px_-2px_rgba(255,69,0,0.3)] transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap cursor-text hover:bg-white rounded p-1 -m-1 transition-colors"
                  onClick={() => { setDraft(reply); setEditing(true); }}
                  title="Click to edit"
                >
                  {reply}
                </p>
              )}
            </div>

            {!editing && (
              <div className="px-4 py-2.5 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                <button
                  onClick={copyAndOpen}
                  className="flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Copy className="h-3 w-3" />
                  Copy & Open
                </button>
                <button
                  onClick={() => { setDraft(reply); setEditing(true); }}
                  className="flex items-center gap-1.5 px-2.5 h-7 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
                {redditAuth.isAuthenticated ? (
                  <button
                    onClick={handlePublish}
                    disabled={posting || !!publishedUrl}
                    className={`flex items-center gap-1.5 px-3 h-7 rounded-md text-[11px] font-semibold transition-colors ${
                      publishedUrl
                        ? 'bg-green-600 text-white'
                        : posting
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-[0_2px_8px_-2px_rgba(255,69,0,0.3)]'
                    }`}
                  >
                    {posting ? (
                      <><Loader2 className="h-3 w-3 animate-spin" /> Posting…</>
                    ) : publishedUrl ? (
                      <><CheckCircle className="h-3 w-3" /> Replied</>
                    ) : (
                      'Publish'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => useRedditAuthStore.getState().ensureRedditConnection()}
                    className="flex items-center gap-1.5 px-3 h-7 rounded-md bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-semibold transition-colors"
                    title="Connect your Reddit account to publish directly"
                  >
                    Connect Reddit to publish
                  </button>
                )}
                {quotaRemaining !== null && !publishedUrl && (
                  <span className="ml-auto text-[10px] text-gray-400 tabular-nums" title="Direct replies through SneakyGuy are capped at 5 per 24h to keep your Reddit account safe">
                    {quotaRemaining} of 5 replies left today
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
