'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { PricingTable } from '@/components/PricingTable';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--primary))]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>

            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">Upgrade to Premium</h1>
              <p className="text-sm text-gray-600">Just $19 - One month of unlimited Reddit lead generation</p>
            </div>

            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 mb-6">
              <span>🚀 Unlock Premium Features</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 font-heading">
              Ready to Scale Your <span className="text-[hsl(var(--primary))]">Reddit Growth</span>?
            </h2>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Join 41 founders & solopreneurs generating qualified leads from Reddit for just <span className="font-bold text-[hsl(var(--primary))]">$19</span>.
              Get 500 AI replies, unlimited keywords, and 24/7 monitoring.
            </p>

            <p className="text-sm text-gray-500 mb-8">
              One-time payment for 30 days. No recurring subscription.
            </p>

            {/* Benefits Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Targeting</h3>
                <p className="text-sm text-gray-600">Automatically find high-intent prospects discussing your solutions</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart Responses</h3>
                <p className="text-sm text-gray-600">Generate authentic, helpful replies that build trust and drive traffic</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">24/7 Monitoring</h3>
                <p className="text-sm text-gray-600">Never miss an opportunity with continuous Reddit monitoring</p>
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <PricingTable
            onPlanSelect={handlePlanSelect}
            showHeader={false}
          />

          {/* Trust Signals */}
          <div className="mt-16 text-center">
            <div className="bg-gray-50 rounded-xl p-8 max-w-3xl mx-auto">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Why Choose SneakyGuy?</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-1">41</div>
                  <div className="text-sm text-gray-600">Founders & Solopreneurs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-1">85%</div>
                  <div className="text-sm text-gray-600">Response Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[hsl(var(--primary))] mb-1">7-Day</div>
                  <div className="text-sm text-gray-600">Money-Back Guarantee</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Questions or need help?
              <a href="mailto:support@sneakyguy.com" className="text-[hsl(var(--primary))] hover:underline ml-1">
                Contact our support team
              </a>
            </p>
            <p className="text-sm text-gray-500">
              One simple price. All features included. 7-day money-back guarantee.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}