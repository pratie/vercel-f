import type { RedditMention } from '@/lib/api';

/**
 * Shared domain helpers for Reddit mentions ("leads").
 * Single source of truth — the dashboard, analytics and exports all import
 * from here instead of re-declaring their own copies.
 */

export interface RawMention {
  id: number;
  brand_id: number;
  title: string;
  content: string;
  url: string;
  subreddit: string;
  author?: string;
  created_utc: number;
  score: number;
  num_comments: number;
  matching_keywords?: string[] | string;
  keyword?: string;
  relevance_score: number | null;
  suggested_comment: string;
  intent?: string | null;
}

export interface Mention {
  id: number;
  brand_id: number;
  title: string;
  content: string;
  url: string;
  subreddit: string;
  author: string;
  created_utc: number;
  score: number;
  num_comments: number;
  matching_keywords: string[];
  relevance_score: number | null;
  /** Backend note: this field holds the relevance *explanation*, not a reply draft. */
  explanation: string;
  intent: string | null;
}

/** The digest service used to write relevance_score=50 with no intent — that's
 * a placeholder, not a real score. Realtime alerts write null. Both count as
 * "not yet scored by AI" and must never be presented as a real 50%. */
export function isUnscored(m: Pick<Mention, 'relevance_score' | 'intent'>): boolean {
  const noIntent = !m.intent || m.intent === 'unknown';
  return m.relevance_score == null || (m.relevance_score === 50 && noIntent);
}

export function isHighIntent(m: Pick<Mention, 'relevance_score' | 'intent'>): boolean {
  if (isUnscored(m)) return false;
  const intent = (m.intent || '').toLowerCase();
  return (
    (m.relevance_score ?? 0) >= 80 ||
    intent.includes('purchase') ||
    intent.includes('solution') ||
    intent.includes('recommendation')
  );
}

/** Placeholder strings the backend has historically stored in suggested_comment. */
const PLACEHOLDER_EXPLANATIONS = [
  'This feature will be live soon! Stay tuned!😊',
  'Failed to parse response',
];

export function transformRawMention(raw: RawMention): Mention {
  const explanation = raw.suggested_comment || '';
  return {
    id: raw.id,
    brand_id: raw.brand_id,
    title: raw.title,
    content: raw.content,
    url: raw.url,
    subreddit: raw.subreddit,
    author: raw.author || 'unknown',
    created_utc: raw.created_utc,
    score: raw.score,
    num_comments: raw.num_comments,
    matching_keywords: Array.isArray(raw.matching_keywords)
      ? raw.matching_keywords
      : raw.keyword
        ? raw.keyword.split(',').map((k) => k.trim()).filter(Boolean)
        : [],
    relevance_score: raw.relevance_score,
    explanation: PLACEHOLDER_EXPLANATIONS.includes(explanation.trim()) ? '' : explanation,
    intent: raw.intent && raw.intent !== 'unknown' ? raw.intent : null,
  };
}

/** Human label for an intent slug: "solution_seeking" → "Solution seeking". */
export function intentLabel(intent: string): string {
  const cleaned = intent.replace(/_/g, ' ').trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/** Consistent per-intent chip styling across dashboard + analytics. */
export function intentTone(intent: string | null): { chip: string; bar: string } {
  const i = (intent || '').toLowerCase();
  if (i.includes('purchase')) return { chip: 'bg-emerald-50 text-emerald-700 border-emerald-100', bar: 'bg-emerald-500' };
  if (i.includes('solution')) return { chip: 'bg-blue-50 text-blue-700 border-blue-100', bar: 'bg-blue-500' };
  if (i.includes('recommendation')) return { chip: 'bg-violet-50 text-violet-700 border-violet-100', bar: 'bg-violet-500' };
  if (i.includes('comparison')) return { chip: 'bg-cyan-50 text-cyan-700 border-cyan-100', bar: 'bg-cyan-500' };
  if (i.includes('complaint')) return { chip: 'bg-rose-50 text-rose-700 border-rose-100', bar: 'bg-rose-500' };
  if (i.includes('feature') || i.includes('feedback')) return { chip: 'bg-amber-50 text-amber-700 border-amber-100', bar: 'bg-amber-500' };
  return { chip: 'bg-gray-50 text-gray-600 border-gray-100', bar: 'bg-gray-400' };
}

/** "2h ago" under 24h · "3d ago" under a week · "Aug 5" beyond that. */
export function relativeTime(createdUtc: number): string {
  const then = createdUtc * 1000;
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const d = new Date(then);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString('en-US', sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** HTML-safe keyword highlighting: both title and keywords are escaped before
 * the <mark> wrapping, so Reddit post titles can't inject markup. */
export function highlightKeywordsSafe(text: string, keywords: string[]): string {
  const safeText = escapeHtml(text);
  if (!keywords || keywords.length === 0) return safeText;
  const pattern = [...keywords]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .map((k) => escapeRegExp(escapeHtml(k)))
    .join('|');
  if (!pattern) return safeText;
  return safeText.replace(
    new RegExp(`(${pattern})`, 'gi'),
    '<mark class="bg-orange-100 text-orange-800 px-0.5 rounded">$1</mark>'
  );
}

export function exportMentionsToCSV(mentions: Mention[], filenamePrefix = 'sneakyguy_leads'): void {
  const headers = ['Title', 'URL', 'Subreddit', 'Posted', 'Upvotes', 'Comments', 'Relevance', 'Intent', 'Matched Keywords'].join(',');
  const rows = mentions.map((m) =>
    [
      `"${(m.title || '').replace(/"/g, '""')}"`,
      `"${m.url || ''}"`,
      `"${m.subreddit || ''}"`,
      `"${new Date(m.created_utc * 1000).toISOString()}"`,
      m.score,
      m.num_comments,
      isUnscored(m) ? '' : m.relevance_score,
      `"${m.intent || ''}"`,
      `"${m.matching_keywords.join('; ')}"`,
    ].join(',')
  );
  const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Backwards-compat alias while old imports migrate.
export type { Mention as TransformedMention };
