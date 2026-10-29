'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from './AuthContext';
import { DesktopNav } from '@/components/nav/DesktopNav';
import { MobileNav } from '@/components/nav/MobileNav';
import { lastProjectId, openProjectId, rememberProject } from '@/components/nav/navModel';
import { useNavData } from '@/components/nav/useNavData';

/**
 * App navigation. Two responsive modes, both CSS-driven:
 *  - < md: top bar plus a bottom tab bar inside a project, with a sheet for
 *    the rest of the sections, the project list and account
 *  - >= md: a sticky left sidebar (project switcher, reply hero, task nav)
 *    that collapses to a 72px icon rail
 * All live state (projects, plan, autopilot, queue counts) comes from
 * useNavData, which caches so route changes do not refetch.
 */
export function Sidebar() {
  // useSearchParams needs a Suspense boundary on statically rendered pages;
  // the fallback is the same nav without the ?view= param.
  return (
    <Suspense fallback={<SidebarInner view={null} />}>
      <SidebarWithParams />
    </Suspense>
  );
}

function SidebarWithParams() {
  const searchParams = useSearchParams();
  return <SidebarInner view={searchParams?.get('view') ?? null} />;
}

function SidebarInner({ view }: { view: string | null }) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  // Inside a project the URL says which one. Everywhere else (settings, the
  // project list, billing) keep showing the project you were last in, so the
  // nav never empties out and you never have to click back into a project.
  const routeId = openProjectId(pathname);
  const [rememberedId, setRememberedId] = useState<string | null>(null);
  useEffect(() => {
    if (routeId) { rememberProject(routeId); setRememberedId(routeId); }
    else setRememberedId(lastProjectId());
  }, [routeId]);
  const projectId = routeId ?? rememberedId ?? undefined;
  const { projects, plan, autopilot, counts } = useNavData(projectId, view);
  const project = projectId ? projects.find((p) => String(p.id) === projectId) : undefined;

  // The remembered project was deleted, or nothing is remembered yet: fall
  // back to the first project once the list is in.
  useEffect(() => {
    if (routeId || !projects.length) return;
    if (!rememberedId || !projects.some((p) => String(p.id) === rememberedId)) {
      setRememberedId(String(projects[0].id));
    }
  }, [routeId, rememberedId, projects]);

  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('sidebar-collapsed') === 'true') setCollapsed(true);
    } catch { /* storage blocked: default to expanded */ }
  }, []);

  // Close the sheet on navigation.
  useEffect(() => { setSheetOpen(false); }, [pathname, view]);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('sidebar-collapsed', String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const openSheet = useCallback(() => setSheetOpen(true), []);

  return (
    <>
      <MobileNav
        pathname={pathname}
        view={view}
        projects={projects}
        project={project}
        projectId={projectId}
        counts={counts}
        autopilot={autopilot}
        plan={plan}
        sheetOpen={sheetOpen}
        onSheetOpen={openSheet}
        onSheetClose={closeSheet}
        onLogout={logout}
      />
      <DesktopNav
        pathname={pathname}
        view={view}
        projects={projects}
        project={project}
        projectId={projectId}
        counts={counts}
        autopilot={autopilot}
        plan={plan}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        onLogout={logout}
        userEmail={user?.email}
      />
    </>
  );
}
