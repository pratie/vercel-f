// Public, indexable pages for app/sitemap.ts and app/robots.ts.
//
// Static pages are listed here. Pages under the SEO_SECTIONS folders (free
// tools, comparison pages) are picked up from the filesystem at build time,
// so a new app/tools/<slug>/page.tsx lands in the sitemap without touching
// this file. Dynamic routes there (app/tools/[slug]) cannot be discovered
// that way: append their paths to EXTRA_SITEMAP_PATHS.

export const SITE_URL = 'https://www.sneakyguy.com';

export const STATIC_PUBLIC_PATHS: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

// ── Spot for other pages: /tools/* and /alternatives/* ──────────────────────
// Folders scanned under app/ at build time. Every directory with a page file
// becomes a sitemap entry.
export const SEO_SECTIONS = ['tools', 'alternatives'];

// Paths the folder scan cannot see (dynamic segments). Append, one per line,
// e.g. '/tools/reddit-keyword-finder'.
export const EXTRA_SITEMAP_PATHS: string[] = [];

// App routes behind sign-in. Never indexed.
export const PRIVATE_PATH_PREFIXES = [
  '/mentions',
  '/projects',
  '/settings',
  '/upgrade',
  '/home',
  '/visibility',
  '/api',
  '/login',
  '/verify-email',
  '/reddit-callback',
  '/payment-success',
  '/payment-cancelled',
];
