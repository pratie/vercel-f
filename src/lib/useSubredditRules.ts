'use client';

// Subreddit strictness, shared by every badge on the page. Names asked for in
// the same tick go out as one request; answers are kept for the session (the
// server caches them for a week anyway).

import { useEffect, useState } from 'react';
import { api, SubredditRules } from '@/lib/api';

const cache = new Map<string, SubredditRules>();
const queued = new Set<string>();
const inflight = new Set<string>();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;

const key = (name: string) => name.replace(/^\/?r\//i, '').trim().toLowerCase();

function notify() {
  listeners.forEach((fn) => fn());
}

function unknown(name: string): SubredditRules {
  return { name, strictness: 'unknown', summary: '', rules: [], fetched_at: null };
}

function flush() {
  timer = null;
  const names = Array.from(queued);
  queued.clear();
  for (let i = 0; i < names.length; i += 25) {
    const chunk = names.slice(i, i + 25);
    chunk.forEach((n) => inflight.add(n));
    api.getSubredditRules(chunk)
      .then((items) => items.forEach((item) => cache.set(key(item.name), item)))
      .catch(() => { /* badges are a hint; no badge is fine */ })
      .finally(() => {
        chunk.forEach((n) => {
          inflight.delete(n);
          if (!cache.has(n)) cache.set(n, unknown(n));
        });
        notify();
      });
  }
}

function request(names: string[]) {
  let added = false;
  for (const raw of names) {
    const n = key(raw);
    if (!n || cache.has(n) || inflight.has(n) || queued.has(n)) continue;
    queued.add(n);
    added = true;
  }
  if (added && !timer) timer = setTimeout(flush, 0);
}

/** Look up rules for these subreddits. Returns a getter; undefined while loading. */
export function useSubredditRules(names: string[]): (name: string) => SubredditRules | undefined {
  const [, setVersion] = useState(0);
  const joined = names.map(key).filter(Boolean).sort().join(',');

  useEffect(() => {
    const fn = () => setVersion((v) => v + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  useEffect(() => {
    if (joined) request(joined.split(','));
  }, [joined]);

  return (name: string) => cache.get(key(name));
}
