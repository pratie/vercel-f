'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, User } from '@/lib/auth';
import { useRedditAuthStore } from '@/lib/redditAuth';

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
  const redditAuthStore = useRedditAuthStore();

  // Initialize auth state
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [initialize, isInitialized]);

  // Check Reddit auth status when user is authenticated
  useEffect(() => {
    if (user?.token) {
      if (typeof window !== 'undefined') {
        // Only check once per session
        const checkOnce = sessionStorage.getItem('reddit_auth_checked');
        if (!checkOnce) {
          // Use the checkStatus directly with no automatic rechecking
          redditAuthStore.checkStatus(true);
          sessionStorage.setItem('reddit_auth_checked', 'true');
        }
      }
    }
  }, [user, redditAuthStore]);

  // Handle navigation
  useEffect(() => {
    if (!isInitialized) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/blog');

    if (!user?.token && !isPublicRoute) {
      router.push('/');
    } else if (user?.token && pathname === '/login') {
      router.push('/projects');
    }
  }, [user, router, pathname, isInitialized]);

  // While auth state hydrates, hold the app background instead of flashing
  // a bare white document.
  if (!isInitialized) {
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
