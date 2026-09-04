'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, PricingPlan } from '@/lib/api';
import { toast } from 'sonner';

interface PricingTableProps {
  onPlanSelect?: (planId: string) => void;
  showHeader?: boolean;
  compact?: boolean;
}

const fallbackPlans: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'One-Month Access',
    price: '$19',
    billing: 'one-time',
    duration: '1 month',
    popular: true,
    savings: undefined
  }
];

// Benefit first, mechanism second. Buyers don't purchase "15 subreddits
// monitoring". They purchase not missing the customer who asked yesterday.
const features = [
  'Catch buyers the moment they ask, across up to 15 communities',
  'Skip the noise. Every lead scored for buying intent, best ones first',
  'See whether ChatGPT, Gemini, Perplexity and Claude recommend you, checked weekly',
  'Find out who they recommend instead, and the Reddit threads that would change it',
  'Reply in seconds, not hours, with unlimited AI drafts in your voice',
  'Never sound like an ad. Set your tone once, every draft follows it',
  'Set up in 60 seconds. Paste your URL and we build the rest',
  'Zero risk: 7-day money-back guarantee, nothing auto-renews',
];

export function PricingTable({ onPlanSelect, showHeader = false, compact = false }: PricingTableProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(fallbackPlans);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.getPricingPlans();
        if (response.plans && response.plans.length > 0) {
          const monthlyPlan = response.plans.filter((plan: PricingPlan) => plan.id === 'monthly');
          if (monthlyPlan.length > 0) setPlans(monthlyPlan);
        }
      } catch (error) {
        console.error('Failed to fetch pricing plans, using fallback:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePlanSelect = async (planId: string) => {
    if (onPlanSelect) {
      onPlanSelect(planId);
      return;
    }
    setCheckoutLoading(planId);
    try {
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
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#ff4500] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-center">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md"
          >
            <div className="relative overflow-hidden rounded-2xl border border-black/[0.08] bg-[#ffffff] shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.14)] shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_18px_40px_-24px_rgba(0,0,0,0.9)]">
              <div className={compact ? 'p-6' : 'p-8'}>
                {/* Badge. Understated on purpose: the price and the button carry
                    this card, a shouting badge would only compete with them. */}
                <div className="flex items-center justify-between mb-6">
                  <span className="rounded-md border border-black/[0.08] bg-[#f3efe9] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#78716c]">
                    Most Popular
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#8a827b]">
                    <Shield className="h-3 w-3 text-[#059669]" />
                    Secure checkout
                  </div>
                </div>

                {/* Price. The hero of the card. */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-extrabold tracking-tight tabular-nums text-[#1c1917]">{plan.price}</span>
                    <span className="text-sm font-medium text-[#78716c]">/ {plan.billing}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#78716c]">Full {plan.duration} access. No auto-renewal.</p>
                </div>

                {/* CTA. The single loudest element on whatever page hosts this. */}
                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={checkoutLoading === plan.id}
                  className="group h-12 w-full rounded-xl bg-[#ff4500] text-sm font-semibold text-white shadow-none transition-opacity duration-200 hover:bg-[#ff4500] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#ff4500]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffff]"
                >
                  {checkoutLoading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      Get Instant Access
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Features */}
                {!compact && (
                  <div className="mt-7 border-t border-black/[0.08] pt-7">
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a827b]">What you get</p>
                    <ul className="space-y-3">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-[#059669]/20 bg-[#059669]/[0.09]">
                            <Check className="w-2.5 h-2.5 text-[#059669]" strokeWidth={3} />
                          </span>
                          <span className="text-sm leading-relaxed text-[#44403c]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
