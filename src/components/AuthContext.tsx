'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, User } from '@/lib/auth';
import { flushSignupCompleted } from '@/lib/minilytics';
import { isPublicMarketingPath } from '@/lib/publicRoutes';

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// '/explore' is the anonymous onboarding funnel: it must render with no token.
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/privacy', '/terms', '/about', '/explore'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const store = useAuthStore();
  const { user, logout, initialize, isInitialized } = store;

  // Initialize auth state
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);


  // Tie this browser's visits to the signed-in person. The script loads after
  // hydration, so retry briefly until it is there.
  const email = user?.email;
  useEffect(() => {
    if (!email) return;
    let tries = 0;
    const timer = setInterval(() => {
      if (window.minilytics || ++tries > 20) {
        clearInterval(timer);
        window.minilytics?.('identify', { user_id: email, email, name: email.split('@')[0] });
        flushSignupCompleted();
      }
    }, 500);
    return () => clearInterval(timer);
  }, [email]);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/blog') || isPublicMarketingPath(pathname);

  // Handle navigation
  useEffect(() => {
    if (!isInitialized) return;

    if (!user?.token && !isPublicRoute) {
      router.push('/');
    } else if (user?.token && pathname === '/login') {
      router.push('/home');
    }
  }, [user, router, pathname, isInitialized, isPublicRoute]);

  // While auth state hydrates, hold the app background instead of flashing a
  // bare white document.
  //
  // Public routes are deliberately exempt. `isInitialized` is always false on
  // the server, so gating them here meant the landing page and every blog post
  // prerendered as nothing but this empty div: no headings, no copy, no links.
  // Crawlers were served an empty shell on every indexable page.
  if (!isInitialized && !isPublicRoute) {
    return <div className="min-h-screen bg-paper" aria-busy="true" />;
  }

  const value = {
    user,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
