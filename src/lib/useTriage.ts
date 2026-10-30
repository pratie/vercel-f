'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ReplyStatus, TriagePatch, TriageRow } from '@/lib/api';

/**
 * Per-project triage state shared by every queue page.
 *
 * The server is the source of truth (GET /api/triage/<project>). localStorage
 * keeps a mirror under the keys the app has always used, so the first paint
 * is instant, the nav badges (useNavData) and analytics can read it, and the
 * page keeps working when the API is unreachable:
 *   viewedPosts_<projectId>        JSON array of lead ids
 *   published-comments-<projectId> JSON object { [leadId]: commentUrl | "replied" }
 *   dm-sent-<projectId>            JSON object { [leadId]: sentAtMs }
 * Changes are applied optimistically. A change the server did not take is
 * queued under triage-pending-<projectId> and retried on the next load or
 * when the browser comes back online.
 *
 * Before the server knew about triage, all of this lived only in the
 * browser. The first load per project uploads whatever the server does not
 * have yet (triage-synced-<projectId> marks it done).
 */
export interface Triage {
  viewed: Set<number>;
  /** Truthy means replied. The value is the comment link when we have one, else "replied". */
  published: Record<number, string>;
  dmSent: Record<number, number>;
  /** How the posted reply is doing on Reddit, for replied leads. */
  replyStatus: Record<number, ReplyStatus>;
  markViewed: (id: number) => void;
  /** Mark replied. Pass the comment link if you have it; a thread link is fine too. */
  markPublished: (id: number, commentUrl?: string) => void;
  /** Save (or replace) the link to the user's comment. Rejects with a readable message. */
  saveCommentLink: (id: number, commentUrl: string) => Promise<void>;
  unmarkPublished: (id: number) => void;
  markDmSent: (id: number) => void;
  /** Bumps after every successful sync with the server, so pages can refetch what depends on it. */
  version: number;
}

const REPLIED = 'replied';
const viewedKey = (projectId: string) => `viewedPosts_${projectId}`;
const publishedKey = (projectId: string) => `published-comments-${projectId}`;
const dmSentKey = (projectId: string) => `dm-sent-${projectId}`;
const syncedKey = (projectId: string) => `triage-synced-${projectId}`;
const pendingKey = (projectId: string) => `triage-pending-${projectId}`;

export const TRIAGE_EVENT = 'sneakyguy:triage-updated';

type Pending = Record<number, TriagePatch>;

interface State {
  viewed: Set<number>;
  published: Record<number, string>;
  dmSent: Record<number, number>;
  replyStatus: Record<number, ReplyStatus>;
}

const EMPTY: State = { viewed: new Set(), published: {}, dmSent: {}, replyStatus: {} };

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

function readLocal(projectId: string): State {
  const v = readJson<unknown>(viewedKey(projectId), []);
  const p = readJson<unknown>(publishedKey(projectId), {});
  const d = readJson<unknown>(dmSentKey(projectId), {});
  return {
    viewed: new Set(Array.isArray(v) ? (v as number[]).map(Number) : []),
    published: p && typeof p === 'object' ? (p as Record<number, string>) : {},
    dmSent: d && typeof d === 'object' ? (d as Record<number, number>) : {},
    replyStatus: {},
  };
}

function writeMirror(projectId: string, s: State) {
  writeJson(viewedKey(projectId), Array.from(s.viewed));
  writeJson(publishedKey(projectId), s.published);
  writeJson(dmSentKey(projectId), s.dmSent);
  try {
    window.dispatchEvent(new CustomEvent(TRIAGE_EVENT, { detail: { projectId } }));
  } catch { /* old browsers: the nav catches up on the next navigation */ }
}

function fromServer(rows: TriageRow[]): State {
  const s: State = { viewed: new Set(), published: {}, dmSent: {}, replyStatus: {} };
  for (const r of rows) {
    if (r.viewed_at) s.viewed.add(r.id);
    if (r.replied_at) {
      s.published[r.id] = r.reply_comment_url || REPLIED;
      s.replyStatus[r.id] = r.reply_status || 'unlinked';
    }
    if (r.dm_sent_at) s.dmSent[r.id] = Date.parse(r.dm_sent_at) || Date.now();
  }
  return s;
}

/** Apply one change to local state, the same way the server will. */
function applyPatch(s: State, id: number, patch: TriagePatch): State {
  const next: State = {
    viewed: new Set(s.viewed),
    published: { ...s.published },
    dmSent: { ...s.dmSent },
    replyStatus: { ...s.replyStatus },
  };
  if (patch.viewed === true) next.viewed.add(id);
  if (patch.viewed === false) next.viewed.delete(id);
  if (patch.dm_sent === true) next.dmSent[id] = next.dmSent[id] || Date.now();
  if (patch.dm_sent === false) delete next.dmSent[id];
  if (patch.replied === false) {
    delete next.published[id];
    delete next.replyStatus[id];
  } else if (patch.comment_url !== undefined) {
    const isComment = isCommentLink(patch.comment_url);
    next.published[id] = isComment ? patch.comment_url : REPLIED;
    next.replyStatus[id] = isComment ? 'checking' : 'unlinked';
  } else if (patch.replied === true && !next.published[id]) {
    next.published[id] = REPLIED;
    next.replyStatus[id] = 'unlinked';
  }
  return next;
}

/** A link to one comment (not just the thread). Share links count: the server resolves them. */
export function isCommentLink(url: string | undefined | null): url is string {
  if (!url) return false;
  return /reddit\.com\/(?:(?:r|u|user)\/[^/]+\/)?comments\/[a-z0-9]+\/[^/?#]*\/[a-z0-9]+/i.test(url)
    || /reddit\.com\/r\/[^/]+\/s\/[A-Za-z0-9]+/i.test(url);
}

function mergePending(prev: Pending, id: number, patch: TriagePatch): Pending {
  const merged: TriagePatch = { ...(prev[id] || {}), ...patch };
  // Unreplying wipes any link queued before it; a later link wins over replied.
  if (patch.replied === false) delete merged.comment_url;
  if (patch.comment_url !== undefined) delete merged.replied;
  return { ...prev, [id]: merged };
}

export function useTriage(projectId: string | undefined): Triage {
  const [state, setState] = useState<State>(EMPTY);
  const [version, setVersion] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;

  const commit = useCallback((next: State) => {
    if (!projectId) return;
    stateRef.current = next;
    setState(next);
    writeMirror(projectId, next);
  }, [projectId]);

  const queue = useCallback((id: number, patch: TriagePatch) => {
    if (!projectId) return;
    writeJson(pendingKey(projectId), mergePending(readJson<Pending>(pendingKey(projectId), {}), id, patch));
  }, [projectId]);

  /** Send queued changes. Returns what is still queued after trying. */
  const flushPending = useCallback(async (): Promise<Pending> => {
    if (!projectId) return {};
    const pending = readJson<Pending>(pendingKey(projectId), {});
    const left: Pending = {};
    for (const [key, patch] of Object.entries(pending)) {
      try {
        await api.setTriage(Number(key), patch);
      } catch (e) {
        // 400/404: the server will never take it (bad link, lead gone). Drop it.
        const code = (e as { statusCode?: number }).statusCode;
        if (code !== 400 && code !== 404) left[Number(key)] = patch;
      }
    }
    writeJson(pendingKey(projectId), left);
    return left;
  }, [projectId]);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      await flushPending();
      let { items } = await api.getTriage(projectId);

      if (!readJson<boolean>(syncedKey(projectId), false)) {
        const local = readLocal(projectId);
        const server = fromServer(items);
        const ids = new Set<number>([
          ...Array.from(local.viewed),
          ...Object.keys(local.published).map(Number),
          ...Object.keys(local.dmSent).map(Number),
        ]);
        const upload = Array.from(ids)
          .filter((id) =>
            (local.viewed.has(id) && !server.viewed.has(id))
            || (local.published[id] && !server.published[id])
            || (local.dmSent[id] && !server.dmSent[id]))
          .map((id) => ({
            id,
            viewed: local.viewed.has(id) || undefined,
            published_url: local.published[id] || undefined,
            dm_sent_at_ms: local.dmSent[id] || undefined,
          }));
        if (upload.length > 0) {
          await api.importTriage(projectId, upload);
          items = (await api.getTriage(projectId)).items;
        }
        writeJson(syncedKey(projectId), true);
      }

      let next = fromServer(items);
      // Anything still queued (offline) stays applied on top.
      const pending = readJson<Pending>(pendingKey(projectId), {});
      for (const [key, patch] of Object.entries(pending)) next = applyPatch(next, Number(key), patch);
      commit(next);
      setVersion((v) => v + 1);
    } catch {
      // Offline, signed out or no plan: keep working from the local mirror.
    }
  }, [projectId, flushPending, commit]);

  useEffect(() => {
    if (!projectId) return;
    setState(readLocal(projectId));
    load();
    const onOnline = () => { load(); };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [projectId, load]);

  /** Optimistic change, then the server. Resolves with the server's row. */
  const send = useCallback(async (id: number, patch: TriagePatch): Promise<TriageRow | null> => {
    if (!projectId) return null;
    commit(applyPatch(stateRef.current, id, patch));
    try {
      const row = await api.setTriage(id, patch);
      if (row.reply_status && stateRef.current.published[id]) {
        commit({ ...stateRef.current, replyStatus: { ...stateRef.current.replyStatus, [id]: row.reply_status } });
      }
      return row;
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode;
      if (code === 400 || code === 404) throw e;
      queue(id, patch);
      return null;
    }
  }, [projectId, commit, queue]);

  const markViewed = useCallback((id: number) => {
    if (stateRef.current.viewed.has(id)) return;
    send(id, { viewed: true }).catch(() => {});
  }, [send]);

  const markPublished = useCallback((id: number, commentUrl?: string) => {
    const patch: TriagePatch = isCommentLink(commentUrl) ? { comment_url: commentUrl } : { replied: true };
    send(id, patch).catch(() => {
      // A link the server rejected: still count it as replied.
      send(id, { replied: true }).catch(() => {});
    });
  }, [send]);

  const saveCommentLink = useCallback(async (id: number, commentUrl: string) => {
    const before = stateRef.current;
    try {
      const row = await send(id, { comment_url: commentUrl.trim() });
      // The first check runs right after the save. Pick up its result.
      if (row && row.reply_status === 'checking') window.setTimeout(() => { load(); }, 12_000);
    } catch (e) {
      // The server refused the link (nothing changed there): undo it here too,
      // so the card stays put while the user fixes the link or skips.
      commit(before);
      throw e;
    }
  }, [send, load, commit]);

  const unmarkPublished = useCallback((id: number) => {
    send(id, { replied: false }).catch(() => {});
  }, [send]);

  const markDmSent = useCallback((id: number) => {
    send(id, { dm_sent: true }).catch(() => {});
  }, [send]);

  return {
    viewed: state.viewed,
    published: state.published,
    dmSent: state.dmSent,
    replyStatus: state.replyStatus,
    markViewed,
    markPublished,
    saveCommentLink,
    unmarkPublished,
    markDmSent,
    version,
  };
}
