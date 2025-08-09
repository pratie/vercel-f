'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import Script from 'next/script';
import { toast } from 'sonner';
import Image from 'next/image';
import { motion } from 'framer-motion';

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

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

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
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      await googleLogin(response.credential);
      // Navigation will be handled by AuthContext
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
        width: 280
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
      router.push('/projects');
      return;
    }

    // Check if we're coming from a magic link redirect
    const from = searchParams.get('from');
    const token = searchParams.get('token');
    const magicToken = searchParams.get('magic_token'); // Check for magic_token parameter
    
    if (magicToken) {
      // We have a magic token directly in the URL (from email link)
      setIsCheckingToken(true);
      // Store the token temporarily
      sessionStorage.setItem('magic_token', magicToken);
      // Redirect to verify-email with the token
      router.push(`/verify-email?token=${encodeURIComponent(magicToken)}`);
    } else if (from === '/verify-email' && token) {
      // Redirect to the verify-email page with the token
      router.push(`/verify-email?token=${encodeURIComponent(token)}`);
    } else if (from === '/verify-email') {
      // This is likely from a magic link email where the token wasn't properly included
      // Let's check the URL for any parameters that might contain the token
      const urlParams = new URLSearchParams(window.location.search);
      const possibleToken = urlParams.get('token') || urlParams.get('magic_token') || urlParams.get('t');
      
      if (possibleToken) {
        router.push(`/verify-email?token=${encodeURIComponent(possibleToken)}`);
      } else {
        // Check if token is in localStorage as a last resort
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
        // Show fallback if Google API isn't available
        setShowFallbackGoogle(true);
      }
    }, 2000); // Give more time for Google API to load

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
    
    // Reset Google initialization when returning to main form
    if (showMagicLinkForm) {
      isGoogleInitialized.current = false;
      setTimeout(() => {
        if (window.google && !isGoogleInitialized.current) {
          initializeGoogleSignIn();
        }
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-white to-[hsl(var(--secondary))] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -right-20 top-20 w-96 h-96 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl transform-gpu" />
        <div className="absolute -left-20 bottom-20 w-96 h-96 bg-[hsl(var(--primary))]/10 rounded-full blur-3xl transform-gpu" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[hsl(var(--primary))]/10 transform-gpu"
        >
          {/* Floating Reddit Snoo */}
          <motion.div
            variants={floatingAnimation}
            initial="initial"
            animate="animate"
            className="flex justify-center mb-6 select-none"
          >
            <Image
              src="/reddit-snoo.jpg"
              alt="Reddit Snoo"
              width={80}
              height={80}
              className="drop-shadow-lg transform-gpu"
              priority
            />
          </motion.div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
            Welcome to SneakyGuy
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Sign in to manage your Reddit tracking projects
          </p>

          {showMagicLinkForm ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              {magicLinkSent ? (
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100 mb-4">
                  <p className="text-green-800 font-medium mb-2">Magic link sent!</p>
                  <p className="text-green-700 text-sm">Check your email inbox for the login link.</p>
                </div>
              ) : (
                <form onSubmit={handleMagicLinkRequest} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))] outline-none transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isRequestingMagicLink}
                    className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white py-2 px-4 rounded-md hover:opacity-90 transition flex items-center justify-center"
                  >
                    {isRequestingMagicLink ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
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
                className="w-full mt-4 text-sm text-gray-600 hover:text-[hsl(var(--primary))] transition text-center"
              >
                Back to login options
              </button>
            </motion.div>
          ) : (
            <>
              {/* Google Sign-in Button */}
              <div className="mb-4">
                {!showFallbackGoogle ? (
                  <div ref={googleButtonRef} className="flex justify-center transform-gpu" />
                ) : (
                  <div className="flex justify-center">
                    <button className="w-full max-w-xs bg-white border-2 border-gray-200 rounded-lg px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>
                  </div>
                )}
              </div>
              
              {/* Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-sm text-gray-500 bg-white">or</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
              
              {/* Magic Link Button */}
              <button 
                onClick={toggleMagicLinkForm}
                className="w-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white py-3 px-6 rounded-lg font-medium hover:from-[hsl(var(--primary))] hover:to-[hsl(var(--primary))] transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Sign in with Magic Link
              </button>
            </>
          )}
        </motion.div>
      </div>

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={initializeGoogleSignIn}
      />
    </div>
  );
}
