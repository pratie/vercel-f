import {
  BarChart3,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  Radio,
  Search,
  Send,
  Sparkles,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * The per-project navigation, as data. Both the desktop sidebar and the
 * mobile tab bar read from here so the two never drift apart.
 */
export type NavKey = 'overview' | 'leads' | 'new' | 'signals' | 'replies' | 'dms' | 'autopilot' | 'seo' | 'analytics' | 'results';

export interface NavItem {
  key: NavKey;
  label: string;
  /** Shorter label for the mobile tab bar. */
  short: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
}

export interface NavGroup {
  label: string | null;
  items: NavItem[];
}

export function projectBase(id: string) {
  return `/mentions/${id}`;
}

/**
 * `view` is the leads page's ?view= param: "new" lights up New leads instead
 * of All leads, since both live on the same route.
 */
export function projectNav(id: string, pathname: string, view?: string | null): NavGroup[] {
  const base = projectBase(id);
  const is = (href: string) => pathname === href;
  const item = (key: NavKey, label: string, short: string, href: string, icon: LucideIcon, active = is(href)): NavItem => ({
    key, label, short, href, icon, active,
  });
  const onLeads = pathname === base;
  return [
    { label: null, items: [item('overview', 'Overview', 'Home', `${base}/overview`, LayoutDashboard)] },
    {
      label: 'Opportunities',
      items: [
        item('leads', 'All leads', 'Leads', base, Inbox, onLeads && view !== 'new'),
        item('new', 'New leads', 'New', `${base}?view=new`, Sparkles, onLeads && view === 'new'),
        item('seo', 'SEO opportunities', 'SEO', `${base}/seo`, Search, pathname.startsWith(`${base}/seo`)),
      ],
    },
    {
      label: 'Engage',
      items: [
        item('replies', 'Reply queue', 'Replies', `${base}/replies`, MessageSquare),
        item('dms', 'DM queue', 'DMs', `${base}/dms`, Send),
      ],
    },
    {
      label: 'Track',
      items: [
        item('signals', 'Brand signals', 'Signals', `${base}/signals`, Radio),
        item('analytics', 'Analytics', 'Analytics', `${base}/analytics`, BarChart3),
        item('results', 'Results', 'Results', `${base}/results`, Trophy),
      ],
    },
    { label: 'Automate', items: [item('autopilot', 'Autopilot', 'Autopilot', `${base}/autopilot`, Zap)] },
  ];
}

/** Which project is open, from the URL. */
export function openProjectId(pathname: string): string | undefined {
  return (pathname.match(/^\/(?:mentions|visibility)\/(\d+)/) || [])[1];
}

// Deterministic warm-palette chip per project, keyed off the name so the hue
// is stable across sessions without storing anything.
const CHIP_PALETTE = ['bg-[#d13800]', 'bg-[#b45309]', 'bg-[#be123c]', 'bg-[#6d28d9]', 'bg-[#0f766e]'];
export function projectChip(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return CHIP_PALETTE[hash % CHIP_PALETTE.length];
}

export function projectInitial(name: string) {
  return (name.trim()[0] || '?').toUpperCase();
}

export const FOCUS_RING =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

// The project you were last in. The sidebar keeps showing its full nav on
// pages outside a project (settings, billing, the project list), and /home
// sends you straight back to it after sign-in.
const LAST_PROJECT_KEY = 'last-project-id';
export function rememberProject(id: string) {
  try { localStorage.setItem(LAST_PROJECT_KEY, id); } catch { /* storage blocked */ }
}
export function lastProjectId(): string | null {
  try { return localStorage.getItem(LAST_PROJECT_KEY); } catch { return null; }
}
