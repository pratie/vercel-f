// Client for the free tools under /tools and the affiliate form.
//
// These endpoints are UNAUTHENTICATED on purpose, like src/lib/onboarding.ts:
// the tools are for visitors without an account, so never send a token here.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const base = () => (API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL);

/** The finder scrapes a site and calls a model, so it gets more time. */
const TIMEOUT_MS = 100000;

export interface FinderSubreddit {
  name: string;
  url: string;
  subscribers: number;
  posts_per_day: number | null;
  activity: string;
  why: string;
}

export interface FinderResult {
  query: string;
  product: { name: string; description: string };
  subreddits: FinderSubreddit[];
  cached: boolean;
  fetched_at: string;
}

/** Lowercase from the API; the UI owns the labels. */
export type Strictness = 'strict' | 'careful' | 'open' | 'unknown';

export interface SubredditRule {
  short_name: string;
  description: string;
  flag: 'strict' | 'careful' | null;
}

export interface RulesResult {
  name: string;
  strictness: Strictness;
  summary: string;
  rules: SubredditRule[];
  fetched_at: string;
  subscribers: number | null;
  posts_per_day: number | null;
  activity: string | null;
  over18: boolean;
  url: string;
  cached: boolean;
}

export interface GoogleThread {
  position: number;
  title: string;
  url: string;
  subreddit: string;
  num_comments: number | null;
  score: number | null;
  created_utc: number | null;
  archived: boolean;
  locked: boolean;
}

export interface GoogleThreadsResult {
  keyword: string;
  threads: GoogleThread[];
  cached: boolean;
  fetched_at: string;
}

export class ToolError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** FastAPI sends a string, or for validation errors a list of {msg}. */
function detailOf(body: unknown): string | null {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    const msg = (detail[0] as { msg?: unknown })?.msg;
    if (typeof msg === 'string') return msg;
  }
  return null;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${base()}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      signal: controller.signal,
    });
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === 'AbortError';
    throw new ToolError(
      aborted ? 'That took too long. Try again in a minute.' : 'Could not reach SneakyGuy. Check your connection and try again.',
      0,
    );
  } finally {
    clearTimeout(timer);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ToolError(detailOf(body) || 'Something went wrong on our side. Try again in a minute.', res.status);
  }
  return body as T;
}

export const publicTools = {
  findSubreddits: (input: { url?: string; description?: string }) =>
    request<FinderResult>('/api/public/tools/subreddit-finder', { method: 'POST', body: JSON.stringify(input) }),

  checkRules: (name: string) =>
    request<RulesResult>(`/api/public/tools/subreddit-rules?name=${encodeURIComponent(name)}`),

  googleThreads: (keyword: string) =>
    request<GoogleThreadsResult>(`/api/public/tools/google-threads?keyword=${encodeURIComponent(keyword)}`),

  applyAffiliate: (input: { name: string; email: string; promote_where: string }) =>
    request<{ status: string }>('/api/public/affiliates/apply', { method: 'POST', body: JSON.stringify(input) }),
};

export function formatMembers(n: number | null | undefined): string {
  if (n == null) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M members`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, '')}k members`;
  return `${n} member${n === 1 ? '' : 's'}`;
}

export function formatPostsPerDay(n: number | null | undefined): string {
  if (n == null) return '';
  if (n >= 10) return `${Math.round(n)} posts a day`;
  if (n >= 1) return `${n.toFixed(1).replace(/\.0$/, '')} posts a day`;
  const perWeek = Math.round(n * 7);
  return perWeek < 1 ? 'Under 1 post a week' : `${perWeek} post${perWeek === 1 ? '' : 's'} a week`;
}
