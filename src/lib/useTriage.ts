'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Per-project triage state shared by every queue page.
 *
 * Lives in localStorage under the same keys the leads inbox has always used,
 * so nothing a user has already marked is lost:
 *   viewedPosts_<projectId>        JSON array of lead ids
 *   published-comments_<projectId> JSON object { [leadId]: commentUrl }
 * The DM queue adds one key of its own:
 *   dm-sent-<projectId>            JSON object { [leadId]: sentAtMs }
 */
export interface Triage {
  viewed: Set<number>;
  published: Record<number, string>;
  dmSent: Record<number, number>;
  markViewed: (id: number) => void;
  markPublished: (id: number, commentUrl: string) => void;
  markDmSent: (id: number) => void;
}

const viewedKey = (projectId: string) => `viewedPosts_${projectId}`;
const publishedKey = (projectId: string) => `published-comments-${projectId}`;
const dmSentKey = (projectId: string) => `dm-sent-${projectId}`;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage full or blocked: state still lives in memory */ }
}

export function useTriage(projectId: string | undefined): Triage {
  const [viewed, setViewed] = useState<Set<number>>(new Set());
  const [published, setPublished] = useState<Record<number, string>>({});
  const [dmSent, setDmSent] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!projectId) return;
    const v = readJson<unknown>(viewedKey(projectId), []);
    setViewed(new Set(Array.isArray(v) ? (v as number[]) : []));
    const p = readJson<unknown>(publishedKey(projectId), {});
    setPublished(p && typeof p === 'object' ? (p as Record<number, string>) : {});
    const d = readJson<unknown>(dmSentKey(projectId), {});
    setDmSent(d && typeof d === 'object' ? (d as Record<number, number>) : {});
  }, [projectId]);

  const markViewed = useCallback((id: number) => {
    if (!projectId) return;
    setViewed((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      writeJson(viewedKey(projectId), Array.from(next));
      return next;
    });
  }, [projectId]);

  const markPublished = useCallback((id: number, commentUrl: string) => {
    if (!projectId) return;
    setPublished((prev) => {
      const next = { ...prev, [id]: commentUrl };
      writeJson(publishedKey(projectId), next);
      return next;
    });
  }, [projectId]);

  const markDmSent = useCallback((id: number) => {
    if (!projectId) return;
    setDmSent((prev) => {
      const next = { ...prev, [id]: Date.now() };
      writeJson(dmSentKey(projectId), next);
      return next;
    });
  }, [projectId]);

  return { viewed, published, dmSent, markViewed, markPublished, markDmSent };
}
