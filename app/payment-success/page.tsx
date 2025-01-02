'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { updatePaymentStatus } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  const [redirectCount, setRedirectCount] = useState(3);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        await updatePaymentStatus();
        setStatus('success');
        
        // Start countdown for redirect
        const interval = setInterval(() => {
          setRedirectCount((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              router.push('/projects');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error updating payment status:', error);
        setStatus('error');
        setError('Failed to update payment status. Please contact support.');
      }
    };

    handlePaymentSuccess();
  }, [router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-xl text-muted-foreground">
            Processing your payment...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-destructive">Payment Error</h1>
          <p className="text-xl text-muted-foreground">{error}</p>
          <Button
            onClick={() => router.push('/projects')}
            variant="outline"
            className="mt-4"
          >
            Return to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Payment Successful!</h1>
        <p className="text-xl text-muted-foreground">
          Thank you for your purchase. You can now create projects!
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting to projects in {redirectCount} seconds...
        </p>
        <Button
          onClick={() => router.push('/projects')}
          className="mt-4"
        >
          Go to Projects Now
        </Button>
      </div>
    </div>
  );
}
