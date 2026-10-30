import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicMarketingPath } from './src/lib/publicRoutes'

// List of public routes that don't require authentication
// `/explore` is the anonymous onboarding funnel. It has to work with no token
// at all, that is the entire point of it.
const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/privacy', '/terms', '/about', '/verify-email', '/explore']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public assets and static files
  if (pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.webp') ||
    pathname.startsWith('/mascot/') ||
    pathname.endsWith('.ico') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/blog') ||
    // Free tools, comparison pages, affiliates, and llms.txt are public.
    isPublicMarketingPath(pathname) ||
    pathname.endsWith('.txt') ||
    publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get('token')?.value

  // If there's no token and trying to access protected route
  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api (API routes)
     * - _next (Next.js internals)
     * - static (static files)
     * - public files with specific extensions
     */
    '/((?!api|_next|static|.*\\.ico$).*)',
  ]
}
