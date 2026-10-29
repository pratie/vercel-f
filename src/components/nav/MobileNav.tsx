'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { ChevronsUpDown, CreditCard, LogOut, Menu, MoreHorizontal, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/api';
import { BTN_PRIMARY } from '@/components/ui/sticker';
import { FOCUS_RING, projectChip, projectInitial, projectNav, type NavItem, type NavKey } from './navModel';
import { ProjectList } from './ProjectSwitcher';
import { badgeFor } from './DesktopNav';
import type { NavCounts, Plan } from './useNavData';

const TAB_KEYS: NavKey[] = ['overview', 'leads', 'new', 'replies'];
const PLAN_LABEL: Record<NonNullable<Plan>, string> = { starter: 'Starter plan', growth: 'Growth plan', paid: 'Paid plan' };

/**
 * Mobile navigation, two parts:
 *  - a slim top bar: logo and the open project (tap opens the sheet)
 *  - inside a project, a bottom tab bar with home, the two lead views, the
 *    reply queue and "More"
 * The sheet holds the rest of the sections, the project list and account.
 */
export function MobileNav({
  pathname, view, projects, project, projectId, counts, autopilot, plan, sheetOpen, onSheetOpen, onSheetClose, onLogout,
}: {
  pathname: string;
  /** The leads page's ?view= param. */
  view?: string | null;
  projects: Project[];
  project?: Project;
  projectId?: string;
  counts: NavCounts | null;
  autopilot: boolean | undefined;
  plan: Plan;
  sheetOpen: boolean;
  onSheetOpen: () => void;
  onSheetClose: () => void;
  onLogout: () => void;
}) {
  const groups = projectId ? projectNav(projectId, pathname, view) : [];
  const items = groups.flatMap((g) => g.items);
  const tabs = TAB_KEYS.map((k) => items.find((i) => i.key === k)).filter((i): i is NavItem => !!i);
  const more = items.filter((i) => !TAB_KEYS.includes(i.key));
  const moreActive = more.some((i) => i.active);
  const closeRef = useRef<HTMLButtonElement>(null);
  const planLabel = plan ? PLAN_LABEL[plan] : null;

  useEffect(() => {
    if (!sheetOpen) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onSheetClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [sheetOpen, onSheetClose]);

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden sticky top-0 z-40 flex h-14 items-center gap-2 border-b-2 border-[#1c1917]/[0.08] bg-white px-4">
        <Link href="/home" className={cn('flex shrink-0 items-center rounded-lg', FOCUS_RING)} aria-label="SneakyGuy home">
          <Image src="/logo.png" alt="" width={28} height={17} className="no-outline h-auto w-[28px]" />
        </Link>
        {project ? (
          <button
            type="button"
            onClick={onSheetOpen}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            className={cn('flex h-9 min-w-0 flex-1 items-center gap-2 rounded-xl border-2 border-[#1c1917] bg-white px-2 text-left shadow-[2px_2px_0_#1c1917]', FOCUS_RING)}
          >
            <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-play text-[11px] font-extrabold text-white', projectChip(project.name))}>
              {projectInitial(project.name)}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold text-ink-900">{project.name}</span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          </button>
        ) : (
          <>
            <span className="font-play text-[17px] font-extrabold tracking-[-0.02em] text-ink-900">SneakyGuy</span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={onSheetOpen}
              aria-haspopup="dialog"
              aria-expanded={sheetOpen}
              className={cn('-mr-1.5 rounded-xl p-1.5 text-ink-600 hover:bg-black/[0.04]', FOCUS_RING)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </header>

      {/* Bottom tab bar, only inside a project */}
      {projectId && (
        <nav
          aria-label="Project sections"
          className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#1c1917] bg-white pb-[env(safe-area-inset-bottom)]"
        >
          <ul className="grid h-16 grid-cols-5">
            {tabs.map((t) => {
              const badge = badgeFor(t, counts, autopilot);
              return (
                <li key={t.key} className="min-w-0">
                  <Link
                    href={t.href}
                    aria-current={t.active ? 'page' : undefined}
                    aria-label={badge ? `${t.label}, ${badge.text}` : t.label}
                    className={cn('flex h-full flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold', t.active ? 'text-[#b83200]' : 'text-ink-600', FOCUS_RING)}
                  >
                    <span className={cn('relative flex h-7 w-11 items-center justify-center rounded-full', t.active && 'bg-[#ff4500]/[0.12]')}>
                      <t.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                      {badge && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute -right-1.5 -top-1.5 min-w-[18px] rounded-md px-1 py-[2px] text-center text-[10px] font-semibold tabular-nums leading-none',
                            badge.tone === 'orange' ? 'bg-[#d13800] text-white' : badge.tone === 'ink' ? 'bg-[#1c1917] text-white' : 'bg-black/[0.08] text-ink-900'
                          )}
                        >
                          {badge.text}
                        </span>
                      )}
                    </span>
                    <span className="truncate" aria-hidden="true">{t.short}</span>
                  </Link>
                </li>
              );
            })}
            <li className="min-w-0">
              <button
                type="button"
                onClick={onSheetOpen}
                aria-haspopup="dialog"
                aria-expanded={sheetOpen}
                className={cn('flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold', moreActive ? 'text-[#b83200]' : 'text-ink-600', FOCUS_RING)}
              >
                <span className={cn('relative flex h-7 w-11 items-center justify-center rounded-full', moreActive && 'bg-[#ff4500]/[0.12]')}>
                  <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
                  {autopilot && <span className="absolute right-1 top-0.5 h-2 w-2 rounded-full bg-[#059669]" aria-hidden="true" />}
                </span>
                More
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Sheet */}
      <div
        className={cn('md:hidden fixed inset-0 z-50 bg-[#1c1917]/40 transition-opacity duration-200 motion-reduce:transition-none', sheetOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={onSheetClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!sheetOpen}
        className={cn(
          'md:hidden fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col rounded-t-2xl border-t-2 border-[#1c1917] bg-white pb-[env(safe-area-inset-bottom)]',
          'transition-transform duration-200 ease-out motion-reduce:transition-none',
          sheetOpen ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        )}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="font-play text-[17px] font-extrabold tracking-[-0.02em] text-ink-900">{project ? project.name : 'Menu'}</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onSheetClose}
            className={cn('-mr-1.5 rounded-xl p-1.5 text-ink-400 hover:bg-black/[0.04] hover:text-ink-900', FOCUS_RING)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          {more.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {more.map((i) => {
                const badge = badgeFor(i, counts, autopilot);
                return (
                  <Link
                    key={i.key}
                    href={i.href}
                    aria-current={i.active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-[13.5px] font-semibold',
                      i.active ? 'border-[#1c1917] bg-[#ff4500]/[0.1] text-[#b83200] shadow-[2px_2px_0_#1c1917]' : 'border-[#1c1917]/[0.12] text-ink-900 hover:border-[#1c1917]',
                      FOCUS_RING
                    )}
                  >
                    <i.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{i.label}</span>
                    {badge && (
                      <span className={cn('rounded-md px-1.5 py-[3px] text-[11px] leading-none', badge.tone === 'green' ? 'bg-[#059669]/[0.12] text-[#047857]' : 'bg-black/[0.06] text-ink-600')}>
                        {badge.text}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          <p className="mt-4 px-1 pb-1 text-[11px] font-semibold text-ink-400">{project ? 'Switch project' : 'Projects'}</p>
          <ProjectList projects={projects} currentId={projectId} onPick={onSheetClose} />

          <div className="mt-3 border-t-2 border-[#1c1917]/[0.08] pt-3">
            {planLabel ? (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-[#059669]/[0.1] px-3 py-2">
                <span className="text-[12.5px] font-semibold text-[#047857]">{planLabel}</span>
                <Link href="/settings" onClick={onSheetClose} className={cn('rounded text-[12px] font-medium text-[#047857] underline-offset-2 hover:underline', FOCUS_RING)}>Billing</Link>
              </div>
            ) : plan === null ? (
              <Link href="/upgrade" onClick={onSheetClose} className={cn(BTN_PRIMARY, 'mb-2 w-full')}>
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                Upgrade
              </Link>
            ) : null}
            <Link
              href="/settings"
              onClick={onSheetClose}
              className={cn('flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13.5px] font-medium', pathname.startsWith('/settings') ? 'bg-black/[0.05] text-ink-900' : 'text-ink-600 hover:bg-black/[0.04] hover:text-ink-900', FOCUS_RING)}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              Settings
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className={cn('flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[13.5px] font-medium text-ink-400 hover:bg-black/[0.04] hover:text-ink-900', FOCUS_RING)}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
