'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Target, Brain, Filter, ChevronRight, MessageSquare, Rocket } from 'lucide-react';
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
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-[#fff3f0] rounded-full px-4 py-2 mb-8">
            <Rocket className="h-4 w-4 text-[#ff4500] mr-2" />
            <span className="text-sm font-medium text-[#ff4500]">First 100 Users Only 🎯</span>
          </div>

          <h1 className="font-display text-6xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-[#ff4500] to-gray-900">
            Find Reddit Gold
            <br />
            Before Others Do
          </h1>

          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="text-xl font-medium">Spot Opportunities</span>
            <span className="text-xl font-bold text-[#ff4500]">10x Faster</span>
          </div>

          <div className="space-y-4 mb-8 max-w-2xl mx-auto">
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              Your AI-powered Reddit detective. Uncover trending topics, track brand mentions, and find perfect leads while others are still searching
            </p>
            <p className="text-xl font-semibold text-[#ff4500]">
              — it's like having insider Reddit knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="h-5 w-5 text-[#ff4500]" />
              <span className="text-sm font-medium">Smart Lead Detection</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Brain className="h-5 w-5 text-[#ff4500]" />
              <span className="text-sm font-medium">AI-Powered Insights</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageSquare className="h-5 w-5 text-[#ff4500]" />
              <span className="text-sm font-medium">Real-time Alerts</span>
            </div>
          </div>

          <div className="inline-flex items-center bg-white border border-gray-200 rounded-full px-6 py-2 mb-8 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl text-gray-400 line-through font-medium">$120</span>
                <span className="text-2xl font-bold text-[#ff4500]">$49</span>
                <span className="bg-[#ff4500] text-white text-xs font-semibold px-2 py-1 rounded-full">Save 60%</span>
              </div>
              <span className="text-sm text-gray-600">Lifetime Access</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all group"
              onClick={handleStartFreeTrial}
            >
              Start Finding Gold
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 px-8 py-6 text-lg rounded-xl hover:bg-gray-50 transition-all"
              onClick={handleLiveDemo}
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </main>

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
