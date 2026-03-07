'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import Script from 'next/script';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, googleLogin, isInitialized, requestMagicLink, isRequestingMagicLink } = useAuthStore();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isGoogleInitialized = useRef(false);
  const [email, setEmail] = useState('');
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(false);
  const [showFallbackGoogle, setShowFallbackGoogle] = useState(false);

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      if (!response.credential) throw new Error('No credential received from Google');
      await googleLogin(response.credential);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to log in');
    }
  }, [googleLogin]);

  const initializeGoogleSignIn = useCallback(() => {
    if (!window.google || isGoogleInitialized.current || !googleButtonRef.current) return;
    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 320
      });
      isGoogleInitialized.current = true;
      setShowFallbackGoogle(false);
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      setShowFallbackGoogle(true);
    }
  }, [handleCredentialResponse]);

  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirect') || '/projects';
      router.push(redirectTo);
      return;
    }
    const from = searchParams.get('from');
    const token = searchParams.get('token');
    const magicToken = searchParams.get('magic_token');
    if (magicToken) {
      setIsCheckingToken(true);
      sessionStorage.setItem('magic_token', magicToken);
      router.push(`/verify-email?token=${encodeURIComponent(magicToken)}`);
    } else if (from === '/verify-email' && token) {
      router.push(`/verify-email?token=${encodeURIComponent(token)}`);
    } else if (from === '/verify-email') {
      const urlParams = new URLSearchParams(window.location.search);
      const possibleToken = urlParams.get('token') || urlParams.get('magic_token') || urlParams.get('t');
      if (possibleToken) {
        router.push(`/verify-email?token=${encodeURIComponent(possibleToken)}`);
      } else {
        const storedToken = sessionStorage.getItem('magic_token') || localStorage.getItem('magic_token');
        if (storedToken) {
          router.push(`/verify-email?token=${encodeURIComponent(storedToken)}`);
          sessionStorage.removeItem('magic_token');
          localStorage.removeItem('magic_token');
        } else {
          toast.error('No verification token found. Please request a new magic link.');
        }
      }
    }
  }, [user, router, searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.google && !isGoogleInitialized.current) {
        initializeGoogleSignIn();
      } else if (!window.google) {
        setShowFallbackGoogle(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [initializeGoogleSignIn]);

  const handleMagicLinkRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestMagicLink(email);
      setMagicLinkSent(true);
      toast.success('Magic link sent! Check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    }
  };

  const toggleMagicLinkForm = () => {
    setShowMagicLinkForm(!showMagicLinkForm);
    setMagicLinkSent(false);
    if (showMagicLinkForm) {
      isGoogleInitialized.current = false;
      setTimeout(() => {
        if (window.google && !isGoogleInitialized.current) initializeGoogleSignIn();
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative">
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-orange-50/50 rounded-full blur-[100px]" />
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="SneakyGuy" width={32} height={32} />
            <span className="font-bold text-lg text-gray-900">SneakyGuy</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 p-8">
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 text-center mb-7">Sign in to your account to continue</p>

          {showMagicLinkForm ? (
            <div>
              {magicLinkSent ? (
                <div className="text-center py-4 px-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-green-800 mb-1">Check your inbox</p>
                  <p className="text-xs text-green-600">We sent a login link to your email.</p>
                </div>
              ) : (
                <form onSubmit={handleMagicLinkRequest} className="space-y-3">
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition bg-gray-50/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isRequestingMagicLink}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                  >
                    {isRequestingMagicLink ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      'Send Magic Link'
                    )}
                  </button>
                </form>
              )}
              <button
                onClick={toggleMagicLinkForm}
                className="w-full mt-4 text-xs text-gray-400 hover:text-gray-700 transition text-center font-medium"
              >
                Back to sign in options
              </button>
            </div>
          ) : (
            <>
              {/* Google Sign-in */}
              <div className="mb-4">
                {!showFallbackGoogle ? (
                  <div ref={googleButtonRef} className="flex justify-center" />
                ) : (
                  <button className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2.5 shadow-sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Magic Link */}
              <button
                onClick={toggleMagicLinkForm}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
              >
                <Mail className="h-4 w-4" />
                Sign in with Magic Link
              </button>
            </>
          )}
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-5">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms</Link>
          {' '}&{' '}
          <Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link>
        </p>
      </motion.div>

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={initializeGoogleSignIn}
      />
    </div>
  );
}
