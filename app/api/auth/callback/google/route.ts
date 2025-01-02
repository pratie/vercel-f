import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const headersList = headers();
    const host = headersList.get('host') || '';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const origin = `${protocol}://${host}`;
    
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(`${origin}/login?error=NoCodeProvided`);
    }

    // Exchange code for token with backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.redirect(`${origin}/login?error=${error.detail || 'LoginFailed'}`);
    }

    const data = await response.json();
    
    // Set cookies/local storage
    const responseHeaders = new Headers();
    responseHeaders.append('Set-Cookie', `token=${data.access_token}; Path=/; HttpOnly; SameSite=Lax`);
    responseHeaders.append('Set-Cookie', `userEmail=${data.email}; Path=/; HttpOnly; SameSite=Lax`);

    // Redirect to projects page
    return NextResponse.redirect(`${origin}/projects`, {
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(`${origin}/login?error=ServerError`);
  }
}
