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

// Shown until /payment/plans answers, and if it fails. Mirrors the backend
// registry in routers/payment.py.
const fallbackPlans: PricingPlan[] = [
  {
    id: 'starter_monthly',
    name: 'Starter',
    price: '$29',
    billing: 'per month',
    kind: 'subscription',
    features: [
      '1 project',
      'Reddit leads scored for buying intent',
      'Unlimited reply drafts',
      'AI visibility across 4 assistants, 10 questions',
    ],
  },
  {
    id: 'growth_monthly',
    name: 'Growth',
    price: '$59',
    billing: 'per month',
    kind: 'subscription',
    popular: true,
    features: [
      '3 projects',
      'Everything in Starter',
      'AI visibility, 20 questions per project',
      'Priority on new features as they ship',
    ],
  },
];

// Benefit first, mechanism second. Every plan gets these.
const features = [
  'Catch buyers the moment they ask on Reddit',
  'Every lead scored for buying intent, best ones first',
  'See whether ChatGPT, Gemini, Perplexity and Claude recommend you, checked weekly',
  'See who they recommend instead, and the Reddit threads behind it',
  'Replies drafted in your voice that say you built it',
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
          setPlans(response.plans);
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
      const message = error instanceof Error ? error.message : '';
      toast.error(message.includes('already have an active subscription')
        ? 'You already have a plan. Manage it from Settings.'
        : 'Could not start checkout. Please try again.');
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
      <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full"
          >
            <div className={`relative h-full overflow-hidden rounded-2xl border bg-[#ffffff] shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.14)] ${plan.popular ? 'border-[#d13800]/40' : 'border-black/[0.09]'}`}>
              <div className={compact ? 'p-6' : 'p-8'}>
                {/* Badge. Understated on purpose: the price and the button carry
                    this card, a shouting badge would only compete with them. */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[13px] font-semibold text-[#1c1917]">{plan.name}</span>
                  {plan.popular && (
                    <span className="rounded-md border border-[#d13800]/20 bg-[#d13800]/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#b83200]">
                      Most popular
                    </span>
                  )}
                </div>

                {/* Price. The hero of the card. */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-extrabold tracking-tight tabular-nums text-[#1c1917]">{plan.price}</span>
                    <span className="text-sm font-medium text-[#78716c]">/ {plan.billing}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#78716c]">
                    {plan.kind === 'one_time' || plan.billing === 'one-time'
                      ? 'One payment, no renewal. Full refund within 7 days.'
                      : 'Cancel anytime. Full refund within 7 days of your first payment.'}
                  </p>
                </div>

                {/* CTA. The single loudest element on whatever page hosts this. */}
                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={checkoutLoading === plan.id}
                  className="group h-12 w-full rounded-xl bg-[#d13800] text-sm font-semibold text-white shadow-none transition-opacity duration-200 hover:bg-[#d13800] hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#ff4500]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#ffffff]"
                >
                  {checkoutLoading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      Start {plan.name}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Features */}
                {!compact && (
                  <div className="mt-7 border-t border-black/[0.08] pt-7">
                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a827b]">What you get</p>
                    <ul className="space-y-3">
                      {(plan.features && plan.features.length ? plan.features : features).map((feature, idx) => (
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
      {!compact && (
        <div className="mx-auto mt-8 max-w-3xl">
          <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8a827b]">Every plan</p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-[#44403c]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" strokeWidth={2.5} />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#8a827b]">
            <Shield className="h-3 w-3 text-[#059669]" /> Secure checkout by Dodo Payments
          </p>
        </div>
      )}
    </div>
  );
}
