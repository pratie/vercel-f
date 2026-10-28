'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { api, hasActiveAccess, Project } from '@/lib/api';
import { inDmQueue, inReplyQueue, Mention, transformRawMention } from '@/lib/mentions';

/**
 * Everything the navigation needs to show live state, with light caching so
 * route changes inside a project do not hit the API again:
 *   - the project list (sessionStorage, plus the projects-updated event)
 *   - the plan (one call per session)
 *   - autopilot on/off for the open project (cached per project, plus event)
 *   - queue counts for the open project (one leads fetch per project, 90s TTL,
 *     recomputed from localStorage triage on every navigation and on focus)
 */

const PROJECTS_CACHE_KEY = 'sidebar-projects-v1';
const LEADS_TTL_MS = 90_000;

export interface NavCounts {
  repliesReady: number;
  dmsToSend: number;
  newLeads: number;
}

export type Plan = 'starter' | 'growth' | 'paid' | null | undefined;

const leadsCache = new Map<string, { at: number; mentions: Mention[] }>();
const autopilotCache = new Map<string, boolean>();

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function computeCounts(projectId: string, mentions: Mention[]): NavCounts {
  // Same keys useTriage writes, so the badges match the queues exactly.
  const published = readJson<Record<number, string>>(`published-comments-${projectId}`, {});
  const dmSent = readJson<Record<number, number>>(`dm-sent-${projectId}`, {});
  const dayAgo = Date.now() / 1000 - 86_400;
  return {
    repliesReady: mentions.filter((m) => inReplyQueue(m, published)).length,
    dmsToSend: mentions.filter((m) => inDmQueue(m, dmSent)).length,
    newLeads: mentions.filter((m) => m.created_utc > dayAgo).length,
  };
}

export function useNavData(projectId: string | undefined) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [projects, setProjects] = useState<Project[]>([]);
  const [plan, setPlan] = useState<Plan>(undefined);
  const [autopilot, setAutopilot] = useState<boolean | undefined>(undefined);
  const [counts, setCounts] = useState<NavCounts | null>(null);

  // Projects
  useEffect(() => {
    if (!user) return;
    try {
      const cached = sessionStorage.getItem(PROJECTS_CACHE_KEY);
      if (cached) setProjects(JSON.parse(cached));
    } catch { /* ignore corrupt cache */ }
    api.getProjects()
      .then((list) => {
        setProjects(list);
        sessionStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(list));
      })
      .catch(() => { /* nav stays usable without the switcher */ });
  }, [user]);

  useEffect(() => {
    const onUpdate = (e: Event) => {
      const list = (e as CustomEvent<Project[]>).detail;
      if (Array.isArray(list)) {
        setProjects(list);
        sessionStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(list));
      }
    };
    window.addEventListener('sneakyguy:projects-updated', onUpdate);
    return () => window.removeEventListener('sneakyguy:projects-updated', onUpdate);
  }, []);

  // Plan
  useEffect(() => {
    if (!user) return;
    api.getPaymentStatus()
      .then((st) => {
        if (!hasActiveAccess(st)) { setPlan(null); return; }
        const id = st.subscription_plan || '';
        setPlan(id.startsWith('growth') ? 'growth' : id.startsWith('starter') ? 'starter' : 'paid');
      })
      .catch(() => setPlan(undefined));
  }, [user]);

  // Autopilot for the open project
  useEffect(() => {
    if (!user || !projectId) { setAutopilot(undefined); return; }
    let cancelled = false;
    const cached = autopilotCache.get(projectId);
    setAutopilot(cached);
    if (cached === undefined) {
      api.getAutopilot(projectId)
        .then((s) => { autopilotCache.set(projectId, s.enabled); if (!cancelled) setAutopilot(s.enabled); })
        .catch(() => { /* the pill is optional */ });
    }
    const onUpdate = (e: Event) => {
      const d = (e as CustomEvent<{ projectId: string; enabled: boolean }>).detail;
      if (!d || !d.projectId) return;
      autopilotCache.set(d.projectId, d.enabled);
      if (d.projectId === projectId) setAutopilot(d.enabled);
    };
    window.addEventListener('sneakyguy:autopilot-updated', onUpdate);
    return () => { cancelled = true; window.removeEventListener('sneakyguy:autopilot-updated', onUpdate); };
  }, [user, projectId]);

  // Queue counts for the open project
  useEffect(() => {
    if (!user || !projectId) { setCounts(null); return; }
    let cancelled = false;
    const refresh = async (force = false) => {
      const hit = leadsCache.get(projectId);
      if (hit && !force && Date.now() - hit.at < LEADS_TTL_MS) {
        setCounts(computeCounts(projectId, hit.mentions));
        return;
      }
      if (hit) setCounts(computeCounts(projectId, hit.mentions)); // stale but instant
      try {
        const raw = await api.getMentions(projectId, 0, 5000);
        const mentions = raw.map(transformRawMention);
        leadsCache.set(projectId, { at: Date.now(), mentions });
        if (!cancelled) setCounts(computeCounts(projectId, mentions));
      } catch {
        if (!cancelled && !hit) setCounts(null);
      }
    };
    refresh();
    const onFocus = () => refresh();
    const onStorage = () => {
      const hit = leadsCache.get(projectId);
      if (hit) setCounts(computeCounts(projectId, hit.mentions));
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
    // pathname is a dependency on purpose: every navigation re-reads the
    // triage state the queue pages write to localStorage.
  }, [user, projectId, pathname]);

  return { projects, plan, autopilot, counts };
}
