// Typed client for the public onboarding funnel that powers /explore.
//
// These two endpoints are UNAUTHENTICATED on purpose. The whole point of the
// funnel is that a visitor watches us work on their own site before they are
// ever asked to sign up, so there is no token to send. Do NOT reach for
// getAuthToken() here or add an Authorization header, it would break the
// anonymous flow.
//
// The shapes below mirror the backend contract exactly. If the contract moves,
// this file moves first and everything under components/explore follows.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Same trailing-slash guard src/lib/api.ts uses, so a stray slash in the env
// var cannot produce a double-slash URL.
const getApiBaseUrl = () => (API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL);

const REQUEST_TIMEOUT_MS = 20000;

/* -------------------------------------------------------------------------- */
/* Contract types                                                             */
/* -------------------------------------------------------------------------- */

/** The five choreographed phases, plus the two terminal states. */
export type OnboardingPhase =
  | 'research_company'
  | 'find_communities'
  | 'check_visibility'
  | 'find_threads'
  | 'ready'
  | 'failed';

/** One narration line. `done` flips to true once that line's work finished. */
export interface OnboardingLogEntry {
  text: string;
  done: boolean;
}

/** Filled during phase 0. */
export interface OnboardingCompany {
  name: string;
  description: string;
}

/** One model's answer to the visibility question. Filled during phase 2. */
export interface OnboardingVisibilityEngine {
  engine: string;
  brand_mentioned: boolean;
  competitors: string[];
}

export interface OnboardingVisibility {
  /** The first question asked. Kept for the headline quote. */
  question: string;
  /** Every question asked this run. The teaser asks several. */
  questions?: string[];
  engines: OnboardingVisibilityEngine[];
  /**
   * Tally across every (question, engine) pair. `engines.length` is the number
   * of assistants, not the number of answers, so a three question run across
   * four engines is 12 checks and reporting "0 of 4" undersells it badly.
   */
  checks?: { named: number; total: number };
}

/** One Reddit thread worth joining. Filled during phase 3. */
export interface OnboardingThread {
  title: string;
  url: string;
  subreddit: string;
  score: number;
  num_comments: number;
}

/** The full polled state. Every field is present on every poll. */
export interface OnboardingSession {
  session_id: string;
  url: string;
  phase: OnboardingPhase;
  /** 0..4, and 4 once the phase is "ready". */
  phase_index: number;
  /** Ordered narration, newest last. */
  log: OnboardingLogEntry[];
  company: OnboardingCompany | null;
  keywords: string[];
  subreddits: string[];
  visibility: OnboardingVisibility | null;
  threads: OnboardingThread[];
  error: string | null;
}

export interface OnboardingStartResponse {
  session_id: string;
  status: string;
}

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Thrown by both calls. `statusCode` is 0 for network or timeout failures, so
 * callers can tell "the box is unreachable" apart from "the box said no".
 *
 * Note the setPrototypeOf call: tsconfig targets es5, and a downlevelled class
 * that extends Error breaks `instanceof` without it. Prefer isOnboardingError()
 * anyway, it does not depend on the prototype chain surviving the build.
 */
export class OnboardingError extends Error {
  readonly statusCode: number;
  readonly isOnboardingError = true;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'OnboardingError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, OnboardingError.prototype);
  }

  /** The IP hit the 3-per-hour or 10-per-day cap. */
  get isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  /** Unknown or expired session id. */
  get isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /** Could not reach the API at all. Worth retrying.  */
  get isNetwork(): boolean {
    return this.statusCode === 0;
  }
}

export function isOnboardingError(error: unknown): error is OnboardingError {
  return typeof error === 'object' && error !== null && (error as OnboardingError).isOnboardingError === true;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Total number of steps in the funnel. The UI says "step N of 5". */
export const ONBOARDING_STEP_COUNT = 5;

/** Polling interval the contract asks for. */
export const ONBOARDING_POLL_MS = 1500;

/** True once the session will never change again. */
export function isTerminalPhase(phase: OnboardingPhase): boolean {
  return phase === 'ready' || phase === 'failed';
}

/**
 * Best-effort display domain for a pasted URL. Tolerates a missing scheme and
 * never throws, because this only ever feeds copy on the screen.
 */
export function domainFromUrl(raw: string): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  try {
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withScheme).hostname.replace(/^www\./i, '');
  } catch {
    return trimmed.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0];
  }
}

/* -------------------------------------------------------------------------- */
/* Requests                                                                   */
/* -------------------------------------------------------------------------- */

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      mode: 'cors',
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    throw new OnboardingError(
      aborted ? 'That took too long. Check your connection and try again.' : 'Could not reach SneakyGuy. Check your connection and try again.',
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    // FastAPI puts the human readable string in `detail`. Fall back to a
    // status-appropriate line when the body is empty or not JSON.
    let detail = '';
    try {
      const body = await response.json();
      detail = typeof body?.detail === 'string' ? body.detail : '';
    } catch {
      /* non-JSON error body, use the fallback copy below */
    }
    throw new OnboardingError(detail || defaultMessageFor(response.status), response.status);
  }

  return (await response.json()) as T;
}

function defaultMessageFor(status: number): string {
  if (status === 429) return 'You have run a few of these already. Try again in an hour.';
  if (status === 404) return 'That session has expired.';
  if (status >= 500) return 'Something broke on our side. Try again in a moment.';
  return 'That request did not go through.';
}

/**
 * Kick off a run. Rate limited by IP, 3 per hour and 10 per day, so expect a
 * 429 (OnboardingError with isRateLimited) as a normal outcome, not a crash.
 */
export async function startOnboarding(url: string): Promise<OnboardingStartResponse> {
  return request<OnboardingStartResponse>('/api/onboarding/start', {
    method: 'POST',
    body: JSON.stringify({ url: url.trim() }),
  });
}

/** Read the current state of a run. Poll this every ONBOARDING_POLL_MS. */
export async function getOnboarding(sessionId: string): Promise<OnboardingSession> {
  return request<OnboardingSession>(`/api/onboarding/${encodeURIComponent(sessionId)}`, {
    method: 'GET',
    cache: 'no-store',
  });
}
