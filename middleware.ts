import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/forgot-password']

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
      pathname.endsWith('.ico') ||
      pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  const isPublicRoute = publicRoutes.includes(pathname)
  const token = request.cookies.get('token')?.value

  // If there's no token and trying to access protected route
  if (!token && !isPublicRoute) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // If there's a token and trying to access public route
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/projects', request.url))
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
