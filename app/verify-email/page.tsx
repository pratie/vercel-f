'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyMagicToken, user } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true); // Start with verifying state
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const verificationAttempted = useRef(false);

  // Handle user login redirect
  useEffect(() => {
    if (user?.token) {
      router.push('/projects');
    }
  }, [user, router]);

  useEffect(() => {
    // Prevent multiple verification attempts
    if (verificationAttempted.current) {
      return;
    }

    // Try to get token from URL or from the backend response
    let token = searchParams.get('token');
    
    // If no token in URL, check if we're coming from a backend redirect
    if (!token) {
      // The backend might be redirecting without including the token in the URL
      // Check if there's a token in the session storage or local storage that might have been set by the backend
      const storedToken = sessionStorage.getItem('magic_token') || localStorage.getItem('magic_token');
      
      if (storedToken) {
        token = storedToken;
        // Clean up after use
        sessionStorage.removeItem('magic_token');
        localStorage.removeItem('magic_token');
      } else {
        setIsVerifying(false);
        setVerificationError('Invalid or expired login link.');
        return;
      }
    }

    const verifyToken = async () => {
      verificationAttempted.current = true;
      try {
        await verifyMagicToken(token);
        toast.success('Login successful!');
        // Don't redirect here - let the user effect handle it
      } catch (error: any) {
        console.error('Verification error:', error);
        setVerificationError(error.message || 'Invalid or expired login link.');
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams, verifyMagicToken]);

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
          {/* Reddit Snoo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/reddit-snoo.jpg"
              alt="Reddit Snoo"
              width={80}
              height={80}
              className="drop-shadow-lg"
              priority
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2 bg-gradient-to-r from-[#ff4500] to-[#ff6634] bg-clip-text text-transparent">
            Verifying Your Login
          </h1>

          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4500] mb-4"></div>
              <p className="text-gray-600 text-center">
                Verifying your magic link...
              </p>
            </div>
          ) : verificationError && !user?.token ? (
            <div className="py-6">
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium mb-2">Verification Failed</p>
                <p className="text-red-700 text-sm">{verificationError}</p>
              </div>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-[#ff4500] to-[#ff6634] text-white py-2 px-4 rounded-md hover:opacity-90 transition"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-4">
              Please wait while we verify your login...
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
