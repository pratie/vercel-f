'use client';

import { create } from 'zustand';

export interface User {
  email: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isInitialized: boolean;
  isRequestingMagicLink: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => void;
  googleLogin: (token: string) => Promise<User>;
  requestMagicLink: (email: string) => Promise<void>;
  verifyMagicToken: (token: string) => Promise<User>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Initialize user from localStorage if available
const getInitialUser = () => {
  if (typeof window === 'undefined') return null;
  
  // Prioritize sessionStorage over localStorage for tokens to reduce XSS risk
  const token = sessionStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  
  return token && email ? { token, email } : null;
};

// Set cookie with security attributes
const setCookie = (name: string, value: string) => {
  if (typeof window === 'undefined') return;
  // We can't set HttpOnly cookies from client-side JavaScript
  // This is a client-side cookie with secure attributes
  // The proper solution would be to set HttpOnly cookies from the server
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  document.cookie = `${name}=${value}; path=/; SameSite=Strict; max-age=86400${secure}`;
};

// Remove cookie
const removeCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict`;
};

const authStore = create<AuthState>((set, get) => ({
  user: null,
  isInitialized: false,
  isRequestingMagicLink: false,
  setUser: (user) => {
    if (user) {
      // Store minimal information in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', user.email);
        // Store token in sessionStorage only (not localStorage)
        // This reduces XSS risk as the token is cleared when the browser is closed
        sessionStorage.setItem('token', user.token);
        // Don't set the token in a readable cookie - this should be done server-side as HttpOnly
        // Using an insecure cookie as a fallback only
        setCookie('token', user.token);
      }
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userEmail');
        sessionStorage.removeItem('token');
        localStorage.removeItem('token'); // Clear any legacy token storage
        removeCookie('token');
      }
    }
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userEmail');
      sessionStorage.removeItem('token');
      localStorage.removeItem('token'); // Clear any legacy token storage
      removeCookie('token');
    }
    set({ user: null });
  },
  initialize: () => {
    const user = getInitialUser();
    if (user) {
      // Don't set the token in a readable cookie - this should be done server-side as HttpOnly
      // Using an insecure cookie as a fallback only
      if (typeof window !== 'undefined') {
        setCookie('token', user.token);
      }
    }
    set({ user, isInitialized: true });
  },
  googleLogin: async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google-login?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to login with Google');
      }

      const data = await response.json();
      if (!data.email || !data.access_token) {
        throw new Error('Invalid response from server');
      }

      const user = { email: data.email, token: data.access_token };
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('token', data.access_token);
        // Don't set the token in a readable cookie - this should be done server-side as HttpOnly
        // Using an insecure cookie as a fallback only
        setCookie('token', data.access_token);
      }
      set({ user });
      
      // Force a page reload to ensure middleware picks up the new cookie
      if (typeof window !== 'undefined') {
        window.location.href = '/projects';
      }
      
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },
  
  requestMagicLink: async (email: string) => {
    try {
      set({ isRequestingMagicLink: true });
      
      const response = await fetch('/api/auth/request-login-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to request magic link');
      }
      
      return;
    } catch (error) {
      console.error('Magic link request error:', error);
      throw error;
    } finally {
      set({ isRequestingMagicLink: false });
    }
  },
  
  verifyMagicToken: async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-magic-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify magic link');
      }

      const data = await response.json();
      if (!data.email || !data.access_token) {
        throw new Error('Invalid response from server');
      }

      const user = { email: data.email, token: data.access_token };
      if (typeof window !== 'undefined') {
        localStorage.setItem('userEmail', data.email);
        sessionStorage.setItem('token', data.access_token);
        setCookie('token', data.access_token);
      }
      set({ user });
      
      return user;
    } catch (error) {
      console.error('Magic token verification error:', error);
      throw error;
    }
  }
}));

export const useAuthStore = () => authStore((state) => state);

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // Try to get token from sessionStorage first (memory only)
  const token = sessionStorage.getItem('token');
  // Do not fall back to localStorage for security in production
  return token || (process.env.NODE_ENV === 'development' ? localStorage.getItem('token') : null);
};

export const getUserEmail = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userEmail');
};