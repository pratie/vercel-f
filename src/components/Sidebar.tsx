'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Settings,
  Inbox,
  BarChart3,
  Plus,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  LayoutDashboard,
  Radio,
  MessageSquare,
  Send,
  Zap,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { api, Project, hasActiveAccess } from '@/lib/api';
import { BTN_PRIMARY } from '@/components/ui/sticker';

const PROJECTS_CACHE_KEY = 'sidebar-projects-v1';

type NavItem = { label: string; href: string; icon: typeof Inbox; active: boolean };
type NavGroup = { label: string | null; items: NavItem[] };

/** The per-project navigation, grouped by what the user is doing. */
function projectNav(id: string, pathname: string): NavGroup[] {
  const base = `/mentions/${id}`;
  const is = (href: string) => pathname === href;
  return [
    { label: null, items: [{ label: 'Overview', href: `${base}/overview`, icon: LayoutDashboard, active: is(`${base}/overview`) }] },
    {
      label: 'Find',
      items: [
        { label: 'Opportunities', href: base, icon: Inbox, active: is(base) },
        { label: 'Brand signals', href: `${base}/signals`, icon: Radio, active: is(`${base}/signals`) },
      ],
    },
    {
      label: 'Act',
      items: [
        { label: 'Reply queue', href: `${base}/replies`, icon: MessageSquare, active: is(`${base}/replies`) },
        { label: 'DM queue', href: `${base}/dms`, icon: Send, active: is(`${base}/dms`) },
      ],
    },
    { label: 'Automate', items: [{ label: 'Autopilot', href: `${base}/autopilot`, icon: Zap, active: is(`${base}/autopilot`) }] },
    {
      label: 'More',
      items: [
        { label: 'AI visibility', href: `/visibility/${id}`, icon: Sparkles, active: pathname.startsWith(`/visibility/${id}`) },
        { label: 'Analytics', href: `${base}/analytics`, icon: BarChart3, active: is(`${base}/analytics`) },
      ],
    },
  ];
}

// Deterministic warm-palette dot per project, keyed off the name so the hue
// is stable across sessions without storing anything.
const DOT_PALETTE = ['bg-[#d13800]', 'bg-[#b45309]', 'bg-[#be123c]', 'bg-[#6d28d9]', 'bg-[#0f766e]'];
function projectDot(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return DOT_PALETTE[hash % DOT_PALETTE.length];
}

/**
 * App navigation. Two responsive modes, both CSS-driven (no innerWidth listener):
 *  - < md: a sticky top bar with a hamburger that opens a slide-in drawer
 *  - >= md: a sticky, collapsible left rail
 */
export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  // undefined = not loaded yet, null = no paid plan, string = plan id.
  const [plan, setPlan] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    if (localStorage.getItem('sidebar-collapsed') === 'true') setCollapsed(true);
  }, []);

  // Project quick-switcher. Session-cached so route changes don't refetch.
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

  // Close the drawer on navigation.
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  // Autopilot on/off for the open project, shown as a pill next to the nav item.
  const openProjectId = (pathname.match(/^\/(?:mentions|visibility)\/(\d+)/) || [])[1];
  const [autopilot, setAutopilot] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!user || !openProjectId) return;
    let cancelled = false;
    api.getAutopilot(openProjectId)
      .then((s) => { if (!cancelled) setAutopilot((prev) => ({ ...prev, [openProjectId]: s.enabled })); })
      .catch(() => { /* the pill is optional */ });
    const onUpdate = (e: Event) => {
      const d = (e as CustomEvent<{ projectId: string; enabled: boolean }>).detail;
      if (d && d.projectId) setAutopilot((prev) => ({ ...prev, [d.projectId]: d.enabled }));
    };
    window.addEventListener('sneakyguy:autopilot-updated', onUpdate);
    return () => { cancelled = true; window.removeEventListener('sneakyguy:autopilot-updated', onUpdate); };
  }, [user, openProjectId]);

  useEffect(() => {
    if (!user) return;
    api.getPaymentStatus()
      .then((st) => setPlan(hasActiveAccess(st) ? (st.subscription_plan || 'paid') : null))
      .catch(() => setPlan(undefined));
  }, [user]);

  // Stay in sync when a project is created/deleted elsewhere in the app.
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

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  const navBody = (isDrawer: boolean) => {
    const showLabels = isDrawer || !collapsed;
    const STICKER = 'border-2 border-[#1c1917] bg-white shadow-[3px_3px_0_#1c1917]';
    const planLabel = plan === 'growth_monthly' ? 'Growth plan' : plan === 'starter_monthly' ? 'Starter plan' : plan ? 'Paid plan' : null;

    return (
      <>
        {/* Logo + collapse toggle */}
        <div className={cn('h-16 flex items-center shrink-0', showLabels ? 'px-4 justify-between' : 'px-0 justify-center')}>
          <Link href="/projects" className="flex items-center gap-2 min-w-0">
            <Image src="/logo.png" alt="" width={34} height={21} priority className="shrink-0 h-auto w-[34px] no-outline" />
            {showLabels && (
              <span className="font-play font-extrabold text-[18px] text-ink-900 tracking-[-0.02em] truncate">SneakyGuy</span>
            )}
          </Link>
          {!isDrawer && showLabels && (
            <button
              onClick={toggleCollapse}
              className="p-1 rounded-lg text-ink-400 hover:text-ink-900 hover:bg-black/[0.05] transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isDrawer && collapsed && (
          <div className="px-2 pb-2">
            <button
              onClick={toggleCollapse}
              className="w-full p-2 rounded-xl text-ink-400 hover:text-ink-900 hover:bg-black/[0.05] transition-colors flex items-center justify-center"
              aria-label="Expand sidebar"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Projects: the real navigation */}
        <div className={cn('flex-1 min-h-0 overflow-y-auto pb-3', showLabels ? 'px-3' : 'px-2')}>
          {showLabels && (
            <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
              <Link
                href="/projects"
                className={cn('rounded text-[12.5px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40', pathname === '/projects' ? 'text-ink-900' : 'text-ink-400 hover:text-ink-900')}
              >
                Projects
              </Link>
              <span className="text-[12px] tabular-nums text-ink-400">{projects.length}</span>
            </div>
          )}

          <div className="space-y-1">
            {projects.slice(0, 12).map((p) => {
              const open = new RegExp(`^/(mentions|visibility)/${p.id}(/|$)`).test(pathname);
              const home = `/mentions/${p.id}/overview`;
              const initial = (p.name.trim()[0] || '?').toUpperCase();

              if (!showLabels) {
                return (
                  <Link
                    key={p.id}
                    href={home}
                    title={p.name}
                    className={cn('mx-auto flex h-9 w-9 items-center justify-center rounded-lg font-play text-[14px] font-extrabold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50', projectDot(p.name), open ? 'ring-2 ring-[#1c1917] ring-offset-2' : 'opacity-80 hover:opacity-100')}
                  >
                    {initial}
                  </Link>
                );
              }

              const groups = open ? projectNav(p.id, pathname) : [];
              const pilot = autopilot[p.id];

              return (
                <div key={p.id} className={cn('rounded-xl transition-[box-shadow,border-color] motion-reduce:transition-none', open ? STICKER : 'border-2 border-transparent')}>
                  <Link
                    href={home}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                  >
                    <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-play text-[13px] font-extrabold text-white', projectDot(p.name))}>
                      {initial}
                    </span>
                    <span className={cn('min-w-0 truncate text-[13.5px] text-ink-900', open ? 'font-bold' : 'font-semibold')}>{p.name}</span>
                  </Link>
                  {open && (
                    <nav className="px-1.5 pb-1.5" aria-label={`${p.name} sections`}>
                      {groups.map((g, gi) => (
                        <div key={g.label ?? 'top'} className={gi === 0 ? '' : 'mt-1'}>
                          {g.label && (
                            <p className="px-2.5 pb-0.5 pt-1.5 text-[11px] font-semibold text-ink-400">{g.label}</p>
                          )}
                          <div className="space-y-0.5">
                            {g.items.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                aria-current={item.active ? 'page' : undefined}
                                className={cn(
                                  'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40',
                                  item.active ? 'bg-[#ff4500]/[0.12] font-semibold text-[#b83200]' : 'text-ink-600 hover:bg-black/[0.04] hover:text-ink-900'
                                )}
                              >
                                <item.icon className="h-3.5 w-3.5 shrink-0" />
                                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                {item.label === 'Autopilot' && pilot !== undefined && (
                                  <span
                                    className={cn(
                                      'shrink-0 rounded-md px-1.5 py-px text-[10.5px] font-semibold',
                                      pilot ? 'bg-[#059669]/[0.12] text-[#047857]' : 'bg-black/[0.06] text-ink-600'
                                    )}
                                  >
                                    {pilot ? 'On' : 'Off'}
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </nav>
                  )}
                </div>
              );
            })}
          </div>

          <Link
            href="/projects/new"
            title={!showLabels ? 'New project' : undefined}
            className={cn(
              'mt-2 flex items-center rounded-xl border-2 border-dashed border-ink-300 text-[13px] font-semibold text-ink-600 transition-colors hover:border-[#1c1917] hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40',
              showLabels ? 'gap-2 px-3 py-2' : 'mx-auto h-9 w-9 justify-center'
            )}
          >
            <Plus className="h-4 w-4 shrink-0" />
            {showLabels && 'New project'}
          </Link>
        </div>

        {/* Plan, settings, account */}
        <div className={cn('shrink-0 border-t-2 border-[#1c1917]/[0.08] py-3 space-y-1', showLabels ? 'px-3' : 'px-2')}>
          {showLabels && (
            planLabel ? (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-[#059669]/[0.1] px-3 py-2">
                <span className="text-[12.5px] font-semibold text-[#047857]">{planLabel}</span>
                <Link href="/settings" className="rounded text-[12px] font-medium text-[#047857] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40">Billing</Link>
              </div>
            ) : plan === null ? null : (
              <Link href="/upgrade" className={cn(BTN_PRIMARY, 'mb-2 w-full')}>Upgrade</Link>
            )
          )}
          <Link
            href="/settings"
            title={!showLabels ? 'Settings' : undefined}
            className={cn(
              'flex items-center rounded-lg text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40',
              showLabels ? 'gap-2.5 px-3 py-2' : 'justify-center p-2.5',
              pathname.startsWith('/settings') ? 'bg-black/[0.05] text-ink-900' : 'text-ink-600 hover:bg-black/[0.04] hover:text-ink-900'
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {showLabels && 'Settings'}
          </Link>
          <button
            onClick={logout}
            title={user ? `Sign out ${user.email}` : 'Sign out'}
            className={cn(
              'w-full flex items-center rounded-lg text-[13px] font-medium text-ink-400 hover:bg-black/[0.04] hover:text-ink-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40',
              showLabels ? 'gap-2.5 px-3 py-2' : 'justify-center p-2.5'
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {showLabels && <span className="truncate">Sign out</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* ---- Mobile: sticky top bar (in normal flow, so it never overlaps page content) ---- */}
      <header className="md:hidden sticky top-0 z-40 h-12 flex items-center gap-3 px-4 bg-[#fbfaf9]/95 backdrop-blur border-b border-[#eeecea]">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 -ml-1.5 rounded-xl text-ink-600 hover:bg-black/[0.035] transition-colors duration-150"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/projects" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={26} height={16} className="h-auto w-[26px] no-outline" />
          <span className="font-semibold text-sm text-ink-900 tracking-tight">SneakyGuy</span>
        </Link>
      </header>

      {/* ---- Mobile: drawer + backdrop ---- */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-50 bg-[#241d15]/30 backdrop-blur-[2px] transition-opacity duration-200',
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          'md:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-[#fbfaf9] flex flex-col shadow-xl',
          'transition-transform duration-200 ease-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-label="Navigation"
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-3.5 right-3 p-1.5 rounded-xl text-ink-400 hover:text-ink-600 hover:bg-black/[0.035] transition-colors duration-150"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
        {navBody(true)}
      </aside>

      {/* ---- Desktop: sticky rail ---- */}
      <aside
        className={cn(
          'hidden md:flex sticky top-0 h-screen flex-col bg-[#fbfaf9] border-r-2 border-[#1c1917]/[0.08] shrink-0',
          'transition-[width] duration-200 ease-out',
          collapsed ? 'w-[68px]' : 'w-[248px]'
        )}
      >
        {navBody(false)}
      </aside>
    </>
  );
}
