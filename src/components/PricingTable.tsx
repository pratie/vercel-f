'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Shield, Sparkles } from 'lucide-react';
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

const features = [
  '500 AI-generated replies/month',
  'Unlimited customizable keywords',
  '15 subreddits monitoring',
  'Unlimited reply generation',
  '24/7 Reddit monitoring',
  'AI-powered lead detection',
  'Fine-tune AI tone & style',
  '7-day money-back guarantee',
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
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-center">
        {plans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-md"
          >
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden">
              {/* Top accent */}
              <div className="h-1 bg-gradient-to-r from-orange-500 to-amber-500" />

              <div className={compact ? 'p-6' : 'p-8'}>
                {/* Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                    Most Popular
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <Shield className="h-3 w-3 text-green-500" />
                    Secure checkout
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-5xl font-extrabold text-gray-900 tracking-tight">{plan.price}</span>
                    <span className="text-sm text-gray-400 font-medium">/ {plan.billing}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5">Full {plan.duration} access. No auto-renewal.</p>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={checkoutLoading === plan.id}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white h-12 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md group"
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
                  <div className="mt-7 pt-7 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Everything included</p>
                    <ul className="space-y-3">
                      {features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-green-600" strokeWidth={3} />
                          </div>
                          <span className="text-sm text-gray-600">{feature}</span>
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
