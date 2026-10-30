// Public marketing pages added for SEO: the free tools, the comparison pages
// and the affiliate program. app/sitemap.ts imports this list, and the auth
// guards (middleware.ts, AuthContext) let every path under these prefixes
// through without a token.

export const PUBLIC_ROUTE_PREFIXES = ['/tools', '/alternatives', '/affiliates'] as const;

export const TOOL_ROUTES = [
  '/tools',
  '/tools/subreddit-finder',
  '/tools/subreddit-rules-checker',
  '/tools/reddit-threads-on-google',
] as const;

export const ALTERNATIVE_ROUTES = [
  '/alternatives',
  '/alternatives/bazzly',
  '/alternatives/gummysearch',
  '/alternatives/f5bot',
  '/alternatives/syften',
] as const;

export const PUBLIC_ROUTES: string[] = [...TOOL_ROUTES, ...ALTERNATIVE_ROUTES, '/affiliates'];

/** True for a path under one of the public marketing prefixes. */
export function isPublicMarketingPath(pathname: string): boolean {
  return PUBLIC_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export default PUBLIC_ROUTES;
