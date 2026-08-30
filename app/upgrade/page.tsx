'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { PricingTable } from '@/components/PricingTable';
import { ArrowLeft, Eye, MessageSquare, Search } from 'lucide-react';
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
      <div className="flex min-h-screen items-center justify-center bg-[#0c0a09]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff4500] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0a09] text-[#d6d3d1]">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0c0a09]/[0.92] backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[#a8a29e] transition-colors hover:text-[#fafaf9]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {/* The offer itself. It states the price and the terms, so it is
                body text, not a muted micro label. */}
            <span className="text-[13px] font-semibold text-[#d6d3d1]">$19, one month, no auto renewal</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* The hook: the product demonstrated on the buyer's own problem. */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-[32px] sm:text-[42px] font-bold tracking-[-0.03em] text-[#fafaf9] leading-[1.1] mb-4">
            Right now, AI is answering{' '}
            <em className="font-display font-medium italic text-[#ff4500]">without you</em>
          </h1>
          <p className="text-[17px] leading-relaxed text-[#d6d3d1]">
            Your buyers ask Reddit, then they ask ChatGPT. SneakyGuy finds the conversations
            worth joining and tracks whether the assistants start naming you.
          </p>
        </div>

        {/*
          Concrete demonstration. These are real answers we recorded.
          Toned to match PhaseVisibility on /explore: the recommended names are
          the bright, legible content, and the "not mentioned" verdict below the
          rule is deliberately quiet. A dim dot and grey text, no red, no
          warning icon. Decorating it would make the fact read as a sales trick.
        */}
        <div className="mb-12 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#1c1917]">
          <div className="flex items-center gap-2 border-b border-white/[0.08] px-5 py-3.5 sm:px-6">
            <Search className="h-3.5 w-3.5 shrink-0 text-[#78716c]" />
            <span className="text-[13px] text-[#fafaf9]">
              &ldquo;What are the best tools to find leads on Reddit?&rdquo;
            </span>
          </div>
          <div className="grid divide-y divide-white/[0.08] sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
            {[
              { engine: 'ChatGPT', named: ['Leado', 'Leadline', 'Optareach', 'LeadSnipe', 'Leadmatically'] },
              { engine: 'Perplexity', named: ['Linkeddit', 'CommunityTracker', 'RedReach', 'Buska', 'Syften'] },
            ].map((row) => (
              <div key={row.engine} className="p-5 sm:p-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                  {row.engine} recommended
                </p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {row.named.map((n) => (
                    <span
                      key={n}
                      className="rounded-md border border-white/[0.08] bg-[#292524] px-2.5 py-1 text-[12.5px] leading-tight text-[#d6d3d1]"
                    >
                      {n}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 border-t border-white/[0.08] pt-3.5">
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#57534e]" />
                  <span className="text-[13px] text-[#78716c]">Your product, not mentioned</span>
                </div>
              </div>
            ))}
          </div>
          {/* Not a disclosure. This line carries the argument the panel is
              making, so it reads at #a8a29e rather than the dim disclaimer
              tone, while staying quieter than the recommended names above. */}
          <p className="border-t border-white/[0.08] bg-[#0c0a09] px-5 py-3 text-[11.5px] leading-relaxed text-[#a8a29e] sm:px-6">
            A real check we ran. If the assistants do not say your name, they are saying a competitor&rsquo;s.
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
              icon: Eye,
              title: 'Track whether AI names you',
              body: 'We ask ChatGPT, Gemini, Perplexity and Claude the questions your buyers ask, record who gets recommended, and show you the Reddit threads that would change it.',
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/[0.08] bg-[#1c1917] p-5 sm:p-6">
              <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-[#292524] text-[#a8a29e]">
                <f.icon className="h-4 w-4" />
              </span>
              <h3 className="mb-1.5 text-[15px] font-bold tracking-tight text-[#fafaf9]">{f.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-[#d6d3d1]">{f.body}</p>
            </div>
          ))}
        </div>

        <PricingTable onPlanSelect={handlePlanSelect} showHeader={false} />

        <div className="mt-12 text-center">
          <p className="text-[13px] text-[#78716c]">
            Questions?{' '}
            <a
              href="mailto:support@sneakyguy.com"
              className="font-medium text-[#a8a29e] underline underline-offset-4 transition-colors hover:text-[#fafaf9]"
            >
              Email support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
