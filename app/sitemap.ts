import fs from 'fs';
import path from 'path';
import type { MetadataRoute } from 'next';

import { getAllPosts } from '@/lib/blog';
import { EXTRA_SITEMAP_PATHS, SEO_SECTIONS, SITE_URL, STATIC_PUBLIC_PATHS } from '@/lib/seoRoutes';

const PAGE_FILES = ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'page.mdx'];

/** Every static route under app/<section>, read from the filesystem at build time. */
function sectionPaths(section: string): string[] {
  const root = path.join(process.cwd(), 'app', section);
  if (!fs.existsSync(root)) return [];
  const out: string[] = [];
  const walk = (dir: string, segments: string[]) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    if (entries.some((e) => e.isFile() && PAGE_FILES.includes(e.name))) {
      out.push(`/${[section, ...segments].join('/')}`);
    }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      // Dynamic segments cannot be listed from disk; private folders and
      // route groups never appear in the URL.
      if (e.name.startsWith('[') || e.name.startsWith('_')) continue;
      const isGroup = e.name.startsWith('(') && e.name.endsWith(')');
      walk(path.join(dir, e.name), isGroup ? segments : [...segments, e.name]);
    }
  };
  walk(root, []);
  return out;
}

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = STATIC_PUBLIC_PATHS.map(({ path: p, priority, changeFrequency }) => ({
    url: `${SITE_URL}${p === '/' ? '' : p}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  for (const post of getAllPosts(['slug', 'date'])) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: toDate(post.date) ?? now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  const seen = new Set(entries.map((e) => e.url));
  const extra = [...SEO_SECTIONS.flatMap(sectionPaths), ...EXTRA_SITEMAP_PATHS];
  for (const p of extra) {
    const url = `${SITE_URL}${p}`;
    if (seen.has(url)) continue;
    seen.add(url);
    entries.push({ url, lastModified: now, changeFrequency: 'monthly', priority: 0.6 });
  }

  return entries;
}
