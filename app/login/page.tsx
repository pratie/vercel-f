'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  const { user, googleLogin, isInitialized } = useAuthStore();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isGoogleInitialized = useRef(false);

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
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      toast.error('Failed to initialize Google Sign-In');
    }
  }, [handleCredentialResponse]);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.google && !isGoogleInitialized.current) {
        initializeGoogleSignIn();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [initializeGoogleSignIn]);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-white to-[#fff3f0] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -right-20 top-20 w-96 h-96 bg-[#ff4500]/10 rounded-full blur-3xl transform-gpu" />
        <div className="absolute -left-20 bottom-20 w-96 h-96 bg-[#ff4500]/10 rounded-full blur-3xl transform-gpu" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-[#ff4500]/10 transform-gpu"
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

          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#ff4500] to-[#ff6634] bg-clip-text text-transparent">
            Welcome to SneakyGuy
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Sign in to manage your Reddit tracking projects
          </p>

          {/* Google Sign-in Button */}
          <div ref={googleButtonRef} className="flex justify-center transform-gpu" />
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
