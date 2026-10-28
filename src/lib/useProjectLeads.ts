'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { api, Project } from '@/lib/api';
import { Mention, transformRawMention } from '@/lib/mentions';

/**
 * Loads one project and all of its leads. The queue pages (replies, DMs,
 * overview) share this so each one is a filter over the same data.
 */
export function useProjectLeads(projectId: string | undefined) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!projectId) return [];
    const raw = await api.getMentions(projectId, 0, 5000);
    const transformed = raw.map(transformRawMention);
    setMentions(transformed);
    return transformed;
  }, [projectId]);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!projectId || isNaN(parseInt(projectId, 10))) {
      toast.error('Invalid project');
      router.push('/projects');
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const p = await api.getProject(projectId);
        if (cancelled) return;
        setProject(p);
        await reload();
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load this project.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, user]);

  return { project, mentions, isLoading, error, reload };
}
