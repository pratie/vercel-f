'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Target, Brain, Filter, ChevronRight, MessageSquare } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/projects');
    }
  }, [user, router]);

  const handleStartFreeTrial = () => {
    router.push('/login');
  };

  const handleLiveDemo = () => {
    const demoSection = document.getElementById('demo');
    demoSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8">
            <span className="inline-flex items-center rounded-full bg-[#ff4500]/10 px-4 py-1 text-sm font-medium text-[#ff4500]">
              🚀 Early Adopter Special
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">
            Discover Reddit
            <br />
            Gold Mines
          </h1>
          <div className="mt-4 flex justify-center items-center text-4xl md:text-6xl font-bold">
            <span>in</span>
            <span className="mx-4 text-[#ff4500] relative">
              Minutes
              <span className="absolute -right-4 top-0">!</span>
            </span>
          </div>
          <p className="mt-8 text-xl leading-8 text-gray-600 max-w-xl mx-auto">
            Turn Reddit into your lead generation powerhouse. AI-powered keyword discovery, relevance scoring, and smart replies - all for a one-time price.
          </p>
          <div className="mt-6">
            <div className="inline-flex items-center rounded-full border border-[#ff4500] px-4 py-1 text-base font-semibold text-[#ff4500]">
              Limited Time: $49 Lifetime Access
            </div>
          </div>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button 
              onClick={handleStartFreeTrial}
              size="lg"
              className="rounded-lg bg-[#ff4500] px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-[#ff4500]/90 transition-all duration-300"
            >
              Get Leads Now 
              <ArrowRight className="ml-2 inline-block h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-50 transition-all duration-300"
              onClick={handleLiveDemo}
            >
              See Live Demo
            </Button>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
            <dl className="grid grid-cols-1 gap-12">
              <div className="relative flex gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff4500] text-white font-bold text-xl flex-shrink-0">
                  1
                </div>
                <div>
                  <dt className="text-xl font-semibold mb-3">Create Your Project</dt>
                  <dd className="text-gray-600">
                    Simply describe your business or product. Our fine-tuned AI will analyze your description and generate targeted keywords and relevant subreddits automatically.
                  </dd>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff4500] text-white font-bold text-xl flex-shrink-0">
                  2
                </div>
                <div>
                  <dt className="text-xl font-semibold mb-3">AI-Powered Discovery</dt>
                  <dd className="text-gray-600">
                    Our AI continuously monitors Reddit, finding relevant posts and scoring them based on their potential value to your business.
                  </dd>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff4500] text-white font-bold text-xl flex-shrink-0">
                  3
                </div>
                <div>
                  <dt className="text-xl font-semibold mb-3">Smart Engagement</dt>
                  <dd className="text-gray-600">
                    For each relevant post, get AI-generated reply suggestions that naturally promote your brand while adding value to the conversation.
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-16">Everything You Need to Generate Leads on Reddit</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start p-6 border border-gray-100 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff4500]/10">
                    <Brain className="h-6 w-6 text-[#ff4500]" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Smart Keyword Discovery</h3>
                  <p className="mt-2 text-gray-600">Generate 15 targeted keywords per project. AI-powered suggestions based on your business needs.</p>
                </div>
              </div>
              
              <div className="flex items-start p-6 border border-gray-100 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff4500]/10">
                    <Target className="h-6 w-6 text-[#ff4500]" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Subreddit Targeting</h3>
                  <p className="mt-2 text-gray-600">Discover 15 relevant subreddits per project where your audience hangs out.</p>
                </div>
              </div>

              <div className="flex items-start p-6 border border-gray-100 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff4500]/10">
                    <MessageSquare className="h-6 w-6 text-[#ff4500]" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">AI-Powered Engagement</h3>
                  <p className="mt-2 text-gray-600">Get relevance scores and suggested replies that convert. Auto-posting coming soon!</p>
                </div>
              </div>

              <div className="flex items-start p-6 border border-gray-100 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#ff4500]/10">
                    <Filter className="h-6 w-6 text-[#ff4500]" />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">Flexible Management</h3>
                  <p className="mt-2 text-gray-600">Create and manage up to 5 projects. Monitor latest mentions or last month's activity.</p>
                </div>
              </div>
            </div>

            {/* Early Adopter Benefits */}
            <div className="mt-16 bg-[#ff4500]/5 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-center mb-8">Early Adopter Benefits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-[#ff4500]">✓</div>
                  <p className="text-gray-800">Lifetime Access</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-[#ff4500]">✓</div>
                  <p className="text-gray-800">Priority Support</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-[#ff4500]">✓</div>
                  <p className="text-gray-800">Feature Requests Priority</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-[#ff4500]">✓</div>
                  <p className="text-gray-800">Early Access to New Features</p>
                </div>
              </div>
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">Coming Soon: AI Auto-posting & Cross-subreddit Automation</p>
              </div>
            </div>

            {/* Price Call-to-Action */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-col items-center">
                <p className="text-lg text-gray-600 mb-4">Limited Time Early Adopter Offer</p>
                <p className="text-4xl font-bold text-gray-900 mb-6">$49 <span className="text-lg text-gray-600">one-time payment</span></p>
                <Button 
                  onClick={handleStartFreeTrial}
                  size="lg"
                  className="rounded-lg bg-[#ff4500] px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-[#ff4500]/90 transition-all duration-300"
                >
                  Get Leads Now 
                  <ArrowRight className="ml-2 inline-block h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 sm:mt-24 mb-16">
        <div className="relative isolate overflow-hidden bg-[#ff4500]">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Grow on Reddit?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90">
                Let AI find and engage your perfect audience
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button 
                  onClick={handleStartFreeTrial}
                  size="lg"
                  className="rounded-lg bg-white px-6 py-3 text-lg font-semibold text-[#ff4500] shadow-sm hover:bg-gray-100"
                >
                  Start Free Trial 
                  <ChevronRight className="ml-2 inline-block h-5 w-5" />
                </Button>
              </div>
              <p className="mt-6 text-sm leading-8 text-white/80">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
