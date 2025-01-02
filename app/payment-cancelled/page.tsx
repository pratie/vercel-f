'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Payment Cancelled</h1>
        <p className="text-xl text-muted-foreground">
          Your payment was cancelled. You can try again when you're ready.
        </p>
        <Button
          onClick={() => router.push('/projects')}
          className="mt-4"
        >
          Return to Projects
        </Button>
      </div>
    </div>
  );
}
