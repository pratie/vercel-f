import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');
  
  if (!token) {
    // Redirect to login page with an error
    const url = new URL('/login', request.url);
    url.searchParams.set('error', 'missing_token');
    return NextResponse.redirect(url);
  }

  // Redirect to the verify-email page with the token
  const url = new URL('/verify-email', request.url);
  url.searchParams.set('token', token);
  
  return NextResponse.redirect(url);
}
