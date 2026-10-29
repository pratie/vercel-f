'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { PricingTable } from '@/components/PricingTable';
import { ArrowLeft, MessageSquare, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function UpgradePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handlePlanSelect = async (planId: string) => {
    try {
      // Get DataFast visitor ID from cookie
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
      };

      const datafastVisitorId = getCookie('datafast_visitor_id');

      const response = await api.createCheckoutSession(planId, datafastVisitorId);
      window.location.href = response.checkout_url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      toast.error('Failed to start checkout process');
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ffffff]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff4500] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#44403c]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-black/[0.09] bg-[#ffffff]/[0.92] backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#78716c] transition-colors hover:text-[#1c1917]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {/* The offer itself. It states the price and the terms, so it is
                body text, not a muted micro label. */}
            <span className="text-[13px] font-semibold text-[#44403c]">From $29 a month, cancel anytime</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* The hook: the product demonstrated on the buyer's own problem. */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-[32px] sm:text-[42px] font-bold tracking-[-0.03em] text-[#1c1917] leading-[1.1] mb-4">
            Your next customers are asking on Reddit right now
          </h1>
          <p className="text-[17px] leading-relaxed text-[#44403c]">
            SneakyGuy finds the threads where people ask for a product like yours, drafts a reply
            that says you built it, and shows you the threads that rank on Google.
          </p>
        </div>

        {/* What you actually get. Two halves of one loop, not a feature dump. */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {[
            {
              icon: MessageSquare,
              title: 'Find the conversations',
              body: 'We scan the subreddits your buyers post in and score every thread for buying intent, so you reply to the three that matter instead of reading two hundred.',
            },
            {
              icon: Search,
              title: 'Reply where Google sends people',
              body: 'We find the Reddit threads that rank on Google for your keywords, so a good reply keeps getting read long after you post it.',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-black/[0.09] bg-[#ffffff] shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.14)] p-5 sm:p-6">
              <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] bg-[#f4f1ec] text-[#78716c]">
                <f.icon className="h-4 w-4" />
              </span>
              <h3 className="mb-1.5 text-[15px] font-bold tracking-tight text-[#1c1917]">{f.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-[#44403c]">{f.body}</p>
            </div>
          ))}
        </div>

        <PricingTable onPlanSelect={handlePlanSelect} showHeader={false} />

        <div className="mt-12 text-center">
          <p className="text-[13px] text-[#8a827b]">
            Questions?{' '}
            <a
              href="mailto:support@sneakyguy.com"
              className="font-medium text-[#78716c] underline underline-offset-4 transition-colors hover:text-[#1c1917]"
            >
              Email support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
