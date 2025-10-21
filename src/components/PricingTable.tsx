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

// Fallback pricing plans in case API fails - Only showing Annual plan
const fallbackPlans: PricingPlan[] = [
  {
    id: 'annual',
    name: 'Annual',
    price: '$69',
    billing: 'per year',
    duration: '12 months',
    popular: true,
    savings: undefined
  }
];

export function PricingTable({ onPlanSelect, showHeader = true, compact = false }: PricingTableProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(fallbackPlans);
  const [selectedPlan, setSelectedPlan] = useState<string>('annual');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.getPricingPlans();
        if (response.plans && response.plans.length > 0) {
          // Filter to show only annual plan
          const annualPlan = response.plans.filter(plan => plan.id === 'annual');
          if (annualPlan.length > 0) {
            setPlans(annualPlan);
            setSelectedPlan('annual');
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
      const response = await api.createCheckoutSession(planId);
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
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-heading"
          >
            Get Started for Just <span className="text-[hsl(var(--primary))]">$69/year</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Everything you need to generate high-quality leads from Reddit. No hidden fees, no monthly charges.
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
            className={`relative bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              plan.popular 
                ? 'border-[hsl(var(--primary))] shadow-lg ring-2 ring-[hsl(var(--primary))]/20' 
                : 'border-gray-200 hover:border-[hsl(var(--primary))]/50'
            } ${compact ? 'p-6' : 'p-8'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  🔥 Most Popular
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-600 ml-2">{plan.billing}</span>
              </div>

              {/* Show monthly breakdown */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 mb-4">
                Just $5.75/month
              </div>

              <p className="text-sm text-gray-600">{plan.duration} access</p>
            </div>

            <Button
              onClick={() => handlePlanSelect(plan.id)}
              disabled={checkoutLoading === plan.id}
              className={`w-full mb-6 transition-all duration-200 ${
                plan.popular
                  ? 'bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900 hover:bg-[hsl(var(--primary))] hover:text-white'
              }`}
            >
              {checkoutLoading === plan.id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {!compact && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">What's included:</h4>
                {features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--secondary))] flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-[hsl(var(--primary))]" />
                    </div>
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <span className="text-xs text-gray-500">+ {features.length - 4} more features</span>
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