'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { api } from '@/lib/api';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await api.updatePaymentStatus();
        if (cancelled) return;
        // A fresh payment invalidates any cached "unpaid" verdict.
        sessionStorage.removeItem('payment-status-v1');
        setStatus('success');
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, colors: ['#ff4500', '#ffa284', '#22c55e', '#f59e0b'] });
        setTimeout(() => {
          confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ff4500', '#ffa284'] });
          confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ff4500', '#ffa284'] });
        }, 350);
      } catch (err) {
        if (cancelled) return;
        console.error('Error updating payment status:', err);
        setStatus('error');
        setError('We received your payment but could not activate it automatically. Please contact support — it will be fixed quickly.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fafafa] px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500 mb-4" />
            <p className="text-sm text-gray-500">Activating your account…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 mb-1.5">You&apos;re in! 🎉</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Your month of SneakyGuy is live. Set up your first project and
              we&apos;ll start pulling leads from Reddit within minutes.
            </p>
            <button
              onClick={() => router.push('/projects')}
              className="w-full h-11 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-[0_4px_16px_-2px_rgba(255,69,0,0.35)] transition-colors flex items-center justify-center gap-2"
            >
              Set up your first project
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-lg font-bold text-red-600 mb-1.5">Something went wrong</h1>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">{error}</p>
            <button
              onClick={() => router.push('/projects')}
              className="w-full h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Go to projects
            </button>
          </>
        )}
      </div>
    </div>
  );
}
