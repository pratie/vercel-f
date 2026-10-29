'use client';

// Where sign-in lands. Straight into the project you were last in (or your
// first one), the way a workspace app opens, instead of a list you have to
// click through every time. No projects yet means the setup wizard.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { lastProjectId } from '@/components/nav/navModel';

export default function HomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    api.getProjects()
      .then((projects) => {
        if (cancelled) return;
        if (!projects.length) { router.replace('/projects/new'); return; }
        const last = lastProjectId();
        const pick = projects.find((p) => String(p.id) === last) ?? projects[0];
        router.replace(`/mentions/${pick.id}`);
      })
      .catch(() => { if (!cancelled) router.replace('/projects'); });
    return () => { cancelled = true; };
  }, [router]);
  return <div className="min-h-[60vh]" aria-busy="true" />;
}
