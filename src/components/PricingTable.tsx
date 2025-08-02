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

// Fallback pricing plans in case API fails
const fallbackPlans: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9',
    billing: 'per month',
    duration: '1 month',
    popular: false,
    savings: undefined
  },
  {
    id: 'six_month',
    name: '6 Months',
    price: '$39',
    billing: 'every 6 months',
    duration: '6 months',
    popular: true,
    savings: 'Save 28%'
  },
  {
    id: 'annual',
    name: 'Annual',
    price: '$69',
    billing: 'per year',
    duration: '12 months',
    popular: false,
    savings: 'Save 36%'
  }
];

export function PricingTable({ onPlanSelect, showHeader = true, compact = false }: PricingTableProps) {
  const [plans, setPlans] = useState<PricingPlan[]>(fallbackPlans);
  const [selectedPlan, setSelectedPlan] = useState<string>('six_month');
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.getPricingPlans();
        if (response.plans && response.plans.length > 0) {
          setPlans(response.plans);
          // Set default to popular plan
          const popularPlan = response.plans.find(plan => plan.popular);
          if (popularPlan) {
            setSelectedPlan(popularPlan.id);
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
    '300 AI-generated replies/month',
    'Unlimited business-specific keywords',
    '15 relevant subreddits monitoring',
    'Unlimited reply generation',
    '24/7 Reddit monitoring',
    'AI-powered lead detection',
    'Personalized response generation',
    '7-day money-back guarantee'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff4500]"></div>
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
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-orange-50 border border-orange-200 text-orange-700 mb-6"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span>Simple, Transparent Pricing</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-heading"
          >
            Choose Your Plan
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            All plans include the same powerful features. Choose the billing cycle that works best for you.
          </motion.p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`relative bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
              plan.popular 
                ? 'border-[#ff4500] shadow-lg ring-2 ring-[#ff4500]/20' 
                : 'border-gray-200 hover:border-[#ff4500]/50'
            } ${compact ? 'p-6' : 'p-8'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
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
              
              {plan.savings && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 mb-4">
                  {plan.savings}
                </div>
              )}
              
              <p className="text-sm text-gray-600">{plan.duration} access</p>
            </div>

            <Button
              onClick={() => handlePlanSelect(plan.id)}
              disabled={checkoutLoading === plan.id}
              className={`w-full mb-6 transition-all duration-200 ${
                plan.popular
                  ? 'bg-[#ff4500] hover:bg-[#ff4500]/90 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900 hover:bg-[#ff4500] hover:text-white'
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
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                      <Check className="w-3 h-3 text-[#ff4500]" />
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
            <h4 className="font-semibold text-gray-900 mb-4">All plans include:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-[#ff4500] flex-shrink-0" />
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