'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { RedditStatusIndicator } from './RedditStatusIndicator';
import { api, Project } from '@/lib/api';

const PROJECTS_CACHE_KEY = 'sidebar-projects-v1';

// Deterministic warm-palette dot per project, keyed off the name so the hue
// is stable across sessions without storing anything.
const DOT_PALETTE = ['bg-orange-500', 'bg-amber-500', 'bg-rose-400', 'bg-violet-400', 'bg-teal-500'];
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

  const navigation = [
    { name: 'Projects', href: '/projects', icon: LayoutGrid, active: pathname === '/projects' },
    { name: 'Settings', href: '/settings', icon: Settings, active: pathname.startsWith('/settings') },
  ];

  const navBody = (isDrawer: boolean) => {
    const showLabels = isDrawer || !collapsed;
    return (
      <>
        {/* Logo + collapse toggle */}
        <div className={cn(
          'h-14 flex items-center border-b border-[#e9e1d4]/70 shrink-0',
          showLabels ? 'px-5 justify-between' : 'px-0 justify-center'
        )}>
          <Link href="/projects" className="flex items-center gap-2 min-w-0">
            <Image
              src="/logo.png"
              alt=""
              width={30}
              height={19}
              priority
              className="shrink-0 h-auto w-[30px] no-outline"
            />
            {showLabels && (
              <span className="font-semibold text-[15px] text-ink-900 tracking-tight truncate">SneakyGuy</span>
            )}
          </Link>
          {!isDrawer && showLabels && (
            <button
              onClick={toggleCollapse}
              className="p-1 rounded-lg text-ink-300 hover:text-ink-600 hover:bg-white/60 transition-colors duration-150"
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isDrawer && collapsed && (
          <div className="px-2 pt-2">
            <button
              onClick={toggleCollapse}
              className="w-full p-2 rounded-xl text-ink-300 hover:text-ink-600 hover:bg-white/60 transition-colors duration-150 flex items-center justify-center"
              aria-label="Expand sidebar"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className={cn('py-3 space-y-1 shrink-0', showLabels ? 'px-3' : 'px-2')}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              title={!showLabels ? item.name : undefined}
              className={cn(
                'relative flex items-center rounded-xl text-[13px] font-medium',
                'transition-[color,background-color,box-shadow] duration-200 ease-out active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60',
                showLabels ? 'gap-2.5 px-3 py-2' : 'justify-center p-2.5',
                item.active
                  ? 'bg-white text-orange-600 shadow-card'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-white/60'
              )}
              aria-current={item.active ? 'page' : undefined}
            >
              <item.icon className={cn('h-4 w-4 shrink-0', item.active ? 'text-orange-500' : 'text-ink-400')} />
              {showLabels && item.name}
            </Link>
          ))}
        </nav>

        {/* Project quick-switcher */}
        {showLabels && projects.length > 0 && (
          <div className="px-3 pb-3 flex-1 min-h-0 overflow-y-auto">
            <p className="px-3 pb-1.5 text-[10.5px] font-semibold text-ink-400 uppercase tracking-[0.08em]">Your projects</p>
            <div className="space-y-1">
              {projects.slice(0, 8).map((p) => {
                const active = pathname.startsWith(`/mentions/${p.id}`);
                return (
                  <Link
                    key={p.id}
                    href={`/mentions/${p.id}`}
                    className={cn(
                      'relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-medium truncate',
                      'transition-[color,background-color,box-shadow] duration-200 ease-out',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60',
                      active
                        ? 'bg-white text-orange-600 shadow-card'
                        : 'text-ink-600 hover:text-ink-900 hover:bg-white/60'
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <span
                      className={cn('h-2 w-2 rounded-full shrink-0', projectDot(p.name), !active && 'opacity-70')}
                      aria-hidden="true"
                    />
                    <span className="truncate">{p.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        {!showLabels && <div className="flex-1" />}

        {/* Bottom */}
        <div className="mt-auto border-t border-[#e9e1d4]/70 shrink-0">
          {showLabels && (
            <div className="p-3">
              <RedditStatusIndicator />
            </div>
          )}
          <div className={cn(showLabels ? 'px-3 pb-3' : 'px-2 pb-3')}>
            {user && showLabels && (
              <div className="px-3 py-1.5 mb-2">
                <p className="text-xs text-ink-400 font-medium truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={logout}
              title={!showLabels ? 'Sign out' : undefined}
              className={cn(
                'w-full flex items-center rounded-lg text-[13px] font-medium text-ink-400 hover:text-ink-700 hover:bg-white/60 transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60',
                showLabels ? 'gap-2.5 px-3 py-2' : 'justify-center p-2.5'
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {showLabels && 'Sign out'}
            </button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {/* ---- Mobile: sticky top bar (in normal flow, so it never overlaps page content) ---- */}
      <header className="md:hidden sticky top-0 z-40 h-12 flex items-center gap-3 px-4 bg-[#f6f1e9]/95 backdrop-blur border-b border-[#e9e1d4]">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-1.5 -ml-1.5 rounded-xl text-ink-600 hover:bg-white/60 transition-colors duration-150"
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
          'md:hidden fixed inset-y-0 left-0 z-50 w-[260px] bg-[#f6f1e9] flex flex-col shadow-xl',
          'transition-transform duration-200 ease-out',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        role="dialog"
        aria-label="Navigation"
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-3.5 right-3 p-1.5 rounded-xl text-ink-400 hover:text-ink-600 hover:bg-white/60 transition-colors duration-150"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
        {navBody(true)}
      </aside>

      {/* ---- Desktop: sticky rail ---- */}
      <aside
        className={cn(
          'hidden md:flex sticky top-0 h-screen flex-col bg-[#f6f1e9] border-r border-[#e9e1d4] shrink-0',
          'transition-[width] duration-200 ease-out',
          collapsed ? 'w-[64px]' : 'w-[230px]'
        )}
      >
        {navBody(false)}
      </aside>
    </>
  );
}
