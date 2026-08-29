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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-[#f0e9dd] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-[13px] font-medium text-ink-600 hover:text-ink-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <span className="text-[13px] font-semibold text-ink-400">$19, one month, no auto renewal</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

        {/* The hook: the product demonstrated on the buyer's own problem. */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-[32px] sm:text-[42px] font-bold tracking-[-0.03em] text-ink-900 leading-[1.1] mb-4">
            Right now, AI is answering{' '}
            <em className="font-display font-medium italic text-orange-600">without you</em>
          </h1>
          <p className="text-[17px] text-ink-600 leading-relaxed">
            Your buyers ask Reddit, then they ask ChatGPT. SneakyGuy finds the conversations
            worth joining and tracks whether the assistants start naming you.
          </p>
        </div>

        {/* Concrete demonstration. These are real answers we recorded. */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-12">
          <div className="px-5 sm:px-6 py-3.5 border-b border-[#f4ede1] flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-ink-300" />
            <span className="text-[13px] text-ink-600">
              &ldquo;What are the best tools to find leads on Reddit?&rdquo;
            </span>
          </div>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#f4ede1]">
            {[
              { engine: 'ChatGPT', named: ['Leado', 'Leadline', 'Optareach', 'LeadSnipe', 'Leadmatically'] },
              { engine: 'Perplexity', named: ['Linkeddit', 'CommunityTracker', 'RedReach', 'Buska', 'Syften'] },
            ].map((row) => (
              <div key={row.engine} className="p-5 sm:p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400 mb-3">
                  {row.engine} recommended
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {row.named.map((n) => (
                    <span key={n} className="chip bg-cream text-ink-700">{n}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-dashed border-[#e9e1d4]">
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                  <span className="text-[12.5px] text-ink-400">Your product, not mentioned</span>
                </div>
              </div>
            ))}
          </div>
          <p className="px-5 sm:px-6 py-3 bg-[#fdf9f3] text-[12px] text-ink-400 border-t border-[#f4ede1]">
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
            <div key={f.title} className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600 mb-4">
                <f.icon className="h-4 w-4" />
              </span>
              <h3 className="text-[15px] font-bold text-ink-900 mb-1.5 tracking-tight">{f.title}</h3>
              <p className="text-[13.5px] text-ink-600 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>

        <PricingTable onPlanSelect={handlePlanSelect} showHeader={false} />

        <div className="mt-12 text-center">
          <p className="text-[13px] text-ink-400">
            Questions?{' '}
            <a href="mailto:support@sneakyguy.com" className="text-orange-600 hover:text-orange-700 font-medium">
              Email support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
