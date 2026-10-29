'use client';

import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, PricingPlan } from '@/lib/api';
import { toast } from 'sonner';

interface PricingTableProps {
  onPlanSelect?: (planId: string) => void;
  showHeader?: boolean;
  compact?: boolean;
  /** Minilytics goal for the plan buttons: checkout_click where they start a checkout. */
  goal?: 'checkout_click' | 'pricing_cta';
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
      'SEO opportunities: Reddit threads that rank on Google',
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
      'Autopilot scans every 6 hours',
      'Priority on new features as they ship',
    ],
  },
];

// Benefit first, mechanism second. Every plan gets these.
const features = [
  'Catch buyers the moment they ask on Reddit',
  'Every lead scored for buying intent, best ones first',
  'The Reddit threads that rank on Google for your keywords',
  'Replies drafted in your voice that say you built it',
];

export function PricingTable({ onPlanSelect, showHeader = false, compact = false, goal = 'checkout_click' }: PricingTableProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(fallbackPlans);
  const [trialDays, setTrialDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.getPricingPlans();
        if (response.plans && response.plans.length > 0) {
          setPlans(response.plans);
          if (typeof response.trial_days === 'number') setTrialDays(response.trial_days);
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
          <div key={plan.id} className="relative w-full">
            {/* Sticker cards. The popular plan's shadow is the brand orange,
                the only place on the page the shadow changes colour. */}
            <div className={`relative h-full overflow-hidden rounded-2xl border-2 border-[#1c1917] bg-[#ffffff] ${plan.popular ? 'shadow-[6px_6px_0_#ff4500]' : 'shadow-[6px_6px_0_#1c1917]'}`}>
              <div className={compact ? 'p-6' : 'p-8'}>
                {/* Badge. Understated on purpose: the price and the button carry
                    this card, a shouting badge would only compete with them. */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-play text-[20px] font-bold text-[#1c1917]">{plan.name}</span>
                  {plan.popular && (
                    <span className="rounded-full border-2 border-[#1c1917] bg-[#ff4500] px-2.5 py-0.5 text-[12px] font-semibold text-[#1c1917]">
                      Most popular
                    </span>
                  )}
                </div>

                {/* Price. The hero of the card. */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-play text-5xl font-extrabold tracking-tight tabular-nums text-[#1c1917]">{plan.price}</span>
                    <span className="text-sm font-medium text-[#78716c]">/ {plan.billing.replace(/^per /, '')}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#78716c]">
                    {plan.kind === 'one_time' || plan.billing === 'one-time'
                      ? 'One payment, no renewal. Full refund within 7 days.'
                      : trialDays > 0
                        ? `${trialDays} days free, then ${plan.price} a month. Cancel anytime.`
                        : 'Billed monthly. Cancel from Settings.'}
                  </p>
                </div>

                {/* CTA. The single loudest element on whatever page hosts this. */}
                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  data-ml-goal={goal}
                  data-ml-goal-plan={plan.id}
                  disabled={checkoutLoading === plan.id}
                  className="group h-12 w-full rounded-xl border-2 border-[#1c1917] bg-[#d13800] text-[15px] font-semibold text-white shadow-[3px_3px_0_#1c1917] transition-[transform,box-shadow] duration-150 hover:bg-[#d13800] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1917] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4500] focus-visible:ring-0"
                >
                  {checkoutLoading === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      {trialDays > 0 && plan.kind !== 'one_time' ? `Start ${trialDays}-day free trial` : `Start ${plan.name}`}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>

                {/* Features */}
                {!compact && (
                  <div className="mt-7 border-t-2 border-[#1c1917]/10 pt-6">
                    <ul className="space-y-3">
                      {(plan.features && plan.features.length ? plan.features : features).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#059669]" strokeWidth={3} />
                          <span className="text-sm leading-relaxed text-[#44403c]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {!compact && (
        <div className="mx-auto mt-10 max-w-3xl">
          <p className="mb-3 text-center text-[13px] font-semibold text-[#1c1917]">Both plans include</p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-[#44403c]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#059669]" strokeWidth={2.5} />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-5 flex items-center justify-center gap-1.5 text-[12px] text-[#78716c]">
            <Shield className="h-3 w-3 text-[#059669]" /> Secure checkout by Dodo Payments
          </p>
        </div>
      )}
    </div>
  );
}
