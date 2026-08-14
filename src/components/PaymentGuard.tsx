'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PaymentGuardProps {
  children: ReactNode;
}

const CACHE_KEY = 'payment-status-v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

function readCache(): boolean | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { hasPaid, at } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return !!hasPaid;
  } catch {
    return null;
  }
}

/**
 * Gates paid-only pages. Verifies once and caches for 5 minutes so hopping
 * between guarded pages doesn't re-fetch and re-flash a loading screen.
 */
export function PaymentGuard({ children }: PaymentGuardProps) {
  const router = useRouter();
  const [hasPaid, setHasPaid] = useState<boolean | null>(() =>
    typeof window === 'undefined' ? null : readCache()
  );

  useEffect(() => {
    if (hasPaid === true) return; // cached pass — nothing to do

    let cancelled = false;
    api.getPaymentStatus()
      .then((status) => {
        if (cancelled) return;
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ hasPaid: status.has_paid, at: Date.now() }));
        setHasPaid(status.has_paid);
        if (!status.has_paid) {
          toast.error('Upgrade your account to access this feature');
          router.push('/upgrade');
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Can't verify — fail closed but keep the user somewhere useful.
        router.push('/projects');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (hasPaid === null) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8" aria-busy="true">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card p-5">
              <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse mb-3" />
              <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return hasPaid ? <>{children}</> : null;
}
