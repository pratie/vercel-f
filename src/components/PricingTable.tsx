'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api, PricingPlan } from '@/lib/api';
import { toast } from 'sonner';

interface PricingTableProps {
  onPlanSelect?: (planId: string) => void;
  showHeader?: boolean;
  compact?: boolean;
}

// Fallback pricing plans in case API fails - Only showing One-Month plan
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

export function PricingTable({ onPlanSelect, showHeader = true, compact = false }: PricingTableProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(fallbackPlans);
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.getPricingPlans();
        if (response.plans && response.plans.length > 0) {
          // Filter to show only monthly plan
          const monthlyPlan = response.plans.filter(plan => plan.id === 'monthly');
          if (monthlyPlan.length > 0) {
            setPlans(monthlyPlan);
            setSelectedPlan('monthly');
          }
        }
        // If API succeeds but returns empty, keep fallback plans
      } catch (error) {
        console.error('Failed to fetch pricing plans, using fallback:', error);
        // Keep fallback plans, don't show error to user
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
    } finally {
      setCheckoutLoading(null);
    }
  };

  const features = [
    '500 AI-generated replies/month',
    'Unlimited customizable keywords',
    '15 customizable subreddits monitoring',
    'Unlimited reply generation with custom prompts',
    '24/7 Reddit monitoring',
    'AI-powered lead detection',
    'Fine-tune AI tone & response style',
    '7-day money-back guarantee'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showHeader && (
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[hsl(var(--secondary))] border border-[hsl(var(--secondary))]/60 text-[hsl(var(--primary))] mb-6"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>One Simple Price</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 font-heading"
          >
            Get Started for Just <span className="text-[#FF6F20]">$19</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Everything you need to generate high-quality leads from Reddit. Pay only for what you need, when you need it.
          </motion.p>
        </div>
      )}

      <div className="flex justify-center max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`relative bg-white/70 backdrop-blur-xl rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${plan.popular
              ? 'border-[#FF6F20] shadow-[0_32px_64px_-16px_rgba(255,111,32,0.15)] ring-4 ring-[#FF6F20]/5'
              : 'border-white/20 shadow-xl'
              } ${compact ? 'p-6' : 'p-10'}`}
          >
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
              <div className="bg-[#FF6F20] text-white px-6 py-2 rounded-full text-sm font-bold shadow-[0_10px_20px_rgba(255,111,32,0.3)] tracking-tight">
                🔥 Best Value Offer
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-6xl font-black text-gray-900 tracking-tight">{plan.price}</span>
                <span className="text-gray-500 text-lg ml-2">{plan.billing}</span>
              </div>

              {/* Show monthly breakdown removed for one-time monthly price */}

              <p className="text-sm text-gray-600">Full {plan.duration} access</p>
            </div>

            <Button
              onClick={() => handlePlanSelect(plan.id)}
              disabled={checkoutLoading === plan.id}
              className={`w-full py-7 rounded-2xl text-lg font-bold transition-all duration-300 ${plan.popular
                ? 'bg-[#FF6F20] hover:bg-[#FF6F20]/90 text-white shadow-[0_20px_40px_rgba(255,111,32,0.25)] hover:shadow-[0_20px_40px_rgba(255,111,32,0.4)]'
                : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg'
                }`}
            >
              {checkoutLoading === plan.id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  Get Instant Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            {!compact && (
              <div className="space-y-4 pt-4">
                <h4 className="font-bold text-gray-900 text-sm tracking-wider uppercase">What's included:</h4>
                {features.slice(0, 5).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6F20]/10 flex items-center justify-center mt-0.5">
                      <Check className="w-3.5 h-3.5 text-[#FF6F20]" />
                    </div>
                    <span className="text-gray-600 font-medium">{feature}</span>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <span className="text-sm font-semibold text-[#FF6F20] cursor-pointer hover:underline underline-offset-4">See all features below</span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {!compact && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <div className="bg-gray-50 rounded-xl p-6 max-w-3xl mx-auto">
            <h4 className="font-semibold text-gray-900 mb-4">Everything you get:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}