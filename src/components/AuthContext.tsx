'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/privacy', '/terms', '/about'];

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


  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/blog');

  // Handle navigation
  useEffect(() => {
    if (!isInitialized) return;

    if (!user?.token && !isPublicRoute) {
      router.push('/');
    } else if (user?.token && pathname === '/login') {
      router.push('/projects');
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
