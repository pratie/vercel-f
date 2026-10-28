'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronsLeft, ChevronsRight, CreditCard, FolderKanban, LogOut, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/api';
import { BTN_PRIMARY } from '@/components/ui/sticker';
import { FOCUS_RING, projectNav, type NavItem } from './navModel';
import { ProjectSwitcher } from './ProjectSwitcher';
import type { NavCounts, Plan } from './useNavData';

const PLAN_LABEL: Record<NonNullable<Plan>, string> = { starter: 'Starter plan', growth: 'Growth plan', paid: 'Paid plan' };

/** The number or state shown next to a nav item. */
export function badgeFor(item: NavItem, counts: NavCounts | null, autopilot: boolean | undefined): { text: string; tone: 'orange' | 'ink' | 'green' | 'muted' } | null {
  switch (item.key) {
    case 'replies':
      return counts && counts.repliesReady > 0 ? { text: String(counts.repliesReady), tone: 'orange' } : null;
    case 'dms':
      return counts && counts.dmsToSend > 0 ? { text: String(counts.dmsToSend), tone: 'ink' } : null;
    case 'leads':
      return counts && counts.newLeads > 0 ? { text: `${counts.newLeads} new`, tone: 'muted' } : null;
    case 'autopilot':
      return autopilot === undefined ? null : autopilot ? { text: 'On', tone: 'green' } : { text: 'Off', tone: 'muted' };
    default:
      return null;
  }
}

const BADGE_TONE = {
  orange: 'bg-[#d13800] text-white',
  ink: 'bg-[#1c1917] text-white',
  green: 'bg-[#059669]/[0.12] text-[#047857]',
  muted: 'bg-black/[0.06] text-ink-600',
};

function Badge({ text, tone, collapsed }: { text: string; tone: keyof typeof BADGE_TONE; collapsed?: boolean }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-md font-semibold tabular-nums leading-none',
        collapsed ? 'absolute -right-1 -top-1 min-w-[18px] px-1 py-[3px] text-center text-[10px]' : 'px-1.5 py-[3px] text-[11px]',
        BADGE_TONE[tone]
      )}
    >
      {text}
    </span>
  );
}

function RailLink({
  href, label, icon: Icon, active, collapsed, badge,
}: {
  href: string;
  label: string;
  icon: NavItem['icon'];
  active: boolean;
  collapsed: boolean;
  badge?: ReturnType<typeof badgeFor>;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        'relative flex items-center rounded-lg text-[13.5px] transition-colors',
        collapsed ? 'mx-auto h-10 w-10 justify-center' : 'gap-2.5 px-2.5 py-[7px]',
        active ? 'bg-[#ff4500]/[0.12] font-semibold text-[#b83200]' : 'font-medium text-ink-600 hover:bg-black/[0.04] hover:text-ink-900',
        FOCUS_RING
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {badge && !collapsed && <Badge text={badge.text} tone={badge.tone} />}
      {badge && collapsed && (badge.tone === 'orange' || badge.tone === 'ink') && <Badge text={badge.text} tone={badge.tone} collapsed />}
      {badge && collapsed && badge.tone === 'green' && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#059669]" aria-hidden="true" />
      )}
      {collapsed && <span className="sr-only">{label}{badge ? `, ${badge.text}` : ''}</span>}
    </Link>
  );
}

/**
 * Desktop sidebar. Reads top to bottom in the order a user works:
 * which project, what is waiting (the reply hero), then Find / Act /
 * Automate / Grow. Collapses to a 72px icon rail.
 */
export function DesktopNav({
  pathname, projects, project, projectId, counts, autopilot, plan, collapsed, onToggleCollapse, onLogout, userEmail,
}: {
  pathname: string;
  projects: Project[];
  project?: Project;
  projectId?: string;
  counts: NavCounts | null;
  autopilot: boolean | undefined;
  plan: Plan;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
  userEmail?: string;
}) {
  const groups = projectId ? projectNav(projectId, pathname) : [];
  const replies = counts ? counts.repliesReady : null;
  const planLabel = plan ? PLAN_LABEL[plan] : null;

  return (
    <aside
      className={cn(
        'hidden md:flex sticky top-0 h-screen shrink-0 flex-col border-r-2 border-[#1c1917]/[0.08] bg-white',
        'transition-[width] duration-200 ease-out motion-reduce:transition-none',
        collapsed ? 'w-[72px]' : 'w-[268px]'
      )}
    >
      {/* Brand */}
      <div className={cn('flex h-16 shrink-0 items-center', collapsed ? 'justify-center' : 'justify-between px-4')}>
        <Link href="/projects" className={cn('flex items-center gap-2 rounded-lg', FOCUS_RING)} aria-label="SneakyGuy, all projects">
          <Image src="/logo.png" alt="" width={34} height={21} priority className="no-outline h-auto w-[34px] shrink-0" />
          {!collapsed && <span className="font-play text-[18px] font-extrabold tracking-[-0.02em] text-ink-900">SneakyGuy</span>}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn('rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-black/[0.05] hover:text-ink-900', FOCUS_RING)}
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Switcher sits outside the scroll area so its popover is never clipped */}
      <div className={cn('relative z-30 shrink-0', collapsed ? 'px-3' : 'px-4')}>
        {collapsed && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn('mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-black/[0.05] hover:text-ink-900', FOCUS_RING)}
            aria-label="Expand sidebar"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <ProjectSwitcher projects={projects} current={project} collapsed={collapsed} />
      </div>

      <div className={cn('flex-1 min-h-0 overflow-y-auto pb-3', collapsed ? 'px-3 pt-3' : 'px-4 pt-4')}>
        {projectId ? (
          <>
            {/* The one thing to do next */}
            {!collapsed && (
              <Link
                href={`/mentions/${projectId}/replies`}
                className={cn(
                  'group block rounded-xl border-2 border-[#1c1917] p-3.5 shadow-[4px_4px_0_#1c1917]',
                  'transition-[transform,box-shadow] duration-150 motion-reduce:transition-none hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_#1c1917]',
                  replies ? 'bg-[#d13800] text-white' : 'bg-[#fbfaf9] text-ink-900',
                  FOCUS_RING
                )}
                aria-label={replies === null ? 'Reply queue, loading' : replies ? `Reply queue, ${replies} ${replies === 1 ? 'reply' : 'replies'} ready` : 'Reply queue, all caught up'}
              >
                <span className={cn('block text-[11.5px] font-semibold', replies ? 'text-white/85' : 'text-ink-400')}>Up next</span>
                <span className="mt-1 flex items-end justify-between gap-2">
                  <span className="font-play text-[34px] font-extrabold leading-none tabular-nums tracking-[-0.03em]" aria-hidden="true">
                    {replies === null ? <span className="inline-block h-8 w-10 animate-pulse rounded bg-current opacity-20 motion-reduce:animate-none" /> : replies}
                  </span>
                  <ArrowRight className={cn('mb-0.5 h-5 w-5 shrink-0 transition-transform motion-reduce:transition-none group-hover:translate-x-0.5', replies ? 'text-white' : 'text-ink-400')} aria-hidden="true" />
                </span>
                <span className={cn('mt-1 block text-[13px] font-semibold leading-tight', replies ? 'text-white' : 'text-ink-600')} aria-hidden="true">
                  {replies === null ? 'Counting replies' : replies === 0 ? 'Reply queue is clear' : replies === 1 ? 'reply ready to post' : 'replies ready to post'}
                </span>
              </Link>
            )}

            <nav className={cn('mt-4', collapsed && 'mt-0')} aria-label="Project sections">
              {groups.map((g, gi) => (
                <div key={g.label ?? 'top'} className={gi === 0 ? '' : collapsed ? 'mt-2 border-t-2 border-[#1c1917]/[0.08] pt-2' : 'mt-3'}>
                  {g.label && !collapsed && (
                    <p className="px-2.5 pb-1 text-[11px] font-semibold text-ink-400">{g.label}</p>
                  )}
                  <div className="space-y-0.5">
                    {g.items.map((item) => (
                      <RailLink
                        key={item.key}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        active={item.active}
                        collapsed={collapsed}
                        badge={badgeFor(item, counts, autopilot)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </>
        ) : (
          <nav className="space-y-0.5" aria-label="Sections">
            <RailLink href="/projects" label="All projects" icon={FolderKanban} active={pathname === '/projects'} collapsed={collapsed} />
          </nav>
        )}
      </div>

      {/* Account */}
      <div className={cn('shrink-0 border-t-2 border-[#1c1917]/[0.08] py-3', collapsed ? 'px-3' : 'px-4')}>
        {!collapsed && (
          planLabel ? (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-[#059669]/[0.1] px-3 py-2">
              <span className="text-[12.5px] font-semibold text-[#047857]">{planLabel}</span>
              <Link href="/settings" className={cn('rounded text-[12px] font-medium text-[#047857] underline-offset-2 hover:underline', FOCUS_RING)}>Billing</Link>
            </div>
          ) : plan === null ? (
            <Link href="/upgrade" className={cn(BTN_PRIMARY, 'mb-2 w-full')}>Upgrade</Link>
          ) : null
        )}
        {collapsed && plan === null && (
          <Link href="/upgrade" title="Upgrade" className={cn('mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-lg text-[#b83200] hover:bg-[#ff4500]/[0.1]', FOCUS_RING)}>
            <CreditCard className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Upgrade</span>
          </Link>
        )}
        <div className="space-y-0.5">
          <RailLink href="/settings" label="Settings" icon={Settings} active={pathname.startsWith('/settings')} collapsed={collapsed} />
          <button
            type="button"
            onClick={onLogout}
            title={collapsed ? 'Sign out' : userEmail}
            className={cn(
              'flex w-full items-center rounded-lg text-[13.5px] font-medium text-ink-400 transition-colors hover:bg-black/[0.04] hover:text-ink-900',
              collapsed ? 'mx-auto h-10 w-10 justify-center' : 'gap-2.5 px-2.5 py-[7px]',
              FOCUS_RING
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {collapsed ? <span className="sr-only">Sign out</span> : <span className="truncate">Sign out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
