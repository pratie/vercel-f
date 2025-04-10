'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface PaymentGuardProps {
  children: ReactNode;
}

export function PaymentGuard({ children }: PaymentGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const status = await api.getPaymentStatus();
        setHasPaid(status.has_paid);
        
        if (!status.has_paid) {
          toast.error('Please upgrade your account to access this feature');
          router.push('/projects');
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
        // If we can't verify payment status, redirect to projects page to be safe
        router.push('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    checkPaymentStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#ff4500]" />
      </div>
    );
  }

  // Only render children if the user has paid
  return hasPaid ? <>{children}</> : null;
}
