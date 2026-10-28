'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { DesktopNav } from '@/components/nav/DesktopNav';
import { MobileNav } from '@/components/nav/MobileNav';
import { openProjectId } from '@/components/nav/navModel';
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
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const projectId = openProjectId(pathname);
  const { projects, plan, autopilot, counts } = useNavData(projectId);
  const project = projectId ? projects.find((p) => String(p.id) === projectId) : undefined;

  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('sidebar-collapsed') === 'true') setCollapsed(true);
    } catch { /* storage blocked: default to expanded */ }
  }, []);

  // Close the sheet on navigation.
  useEffect(() => { setSheetOpen(false); }, [pathname]);

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
