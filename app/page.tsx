'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Target, Brain, Filter, ChevronRight } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/projects');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-[72px] font-bold leading-[1.1] tracking-tight text-gray-900 mb-8">
              Discover Reddit Gold Mines{" "}
              <div>
                in <span className="text-[#ff4500]">Minutes</span>,
              </div>
              <div>Not Hours</div>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-xl">
              Stop drowning in manual Reddit searches. Our AI finds your perfect audience, tracks brand mentions, and delivers hot leads while you focus on growth. Save 20+ hours/week.
            </p>
            <div className="flex gap-6">
              <Button 
                onClick={() => router.push('/login')}
                size="lg"
                className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-10 py-7 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-7 text-lg rounded-full border-2 hover:bg-gray-50 transition-all"
                onClick={() => {
                  const demoSection = document.getElementById('demo');
                  demoSection?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See Live Demo
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#ff4500]" />
                <span className="text-sm text-gray-600">Setup in 2 mins</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-[#ff4500]" />
                <span className="text-sm text-gray-600">AI-Powered Results</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-[#ff4500]/10 rounded-full blur-3xl"></div>
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
              <Image 
                src="/Dashboard.png" 
                alt="SneakyGuy Dashboard" 
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold">Why Businesses Love SneakyGuy</h2>
            <p className="mt-4 text-xl text-gray-600">Powerful features that save you time and drive results</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#ff4500]/10 rounded-xl flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Discovery</h3>
              <p className="text-gray-600">
                Our AI analyzes millions of Reddit posts to find your perfect audience and opportunities in seconds
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#ff4500]/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Lead Scoring</h3>
              <p className="text-gray-600">
                Focus on high-intent leads with our AI relevance scoring. No more guesswork
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="w-12 h-12 bg-[#ff4500]/10 rounded-xl flex items-center justify-center mb-6">
                <Filter className="h-6 w-6 text-[#ff4500]" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Tracking</h3>
              <p className="text-gray-600">
                Never miss a mention with automated tracking and instant notifications
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div id="demo" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">See Your Results in Action</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#ff4500]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="h-6 w-6 text-[#ff4500]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Instant Brand Monitoring</h3>
                    <p className="text-gray-600">Track brand mentions, competitor analysis, and market trends in real-time</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#ff4500]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="h-6 w-6 text-[#ff4500]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Smart Lead Generation</h3>
                    <p className="text-gray-600">Find potential customers discussing problems your product solves</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-[#ff4500]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="h-6 w-6 text-[#ff4500]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Engagement Analytics</h3>
                    <p className="text-gray-600">Measure impact with detailed analytics and engagement metrics</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-[#ff4500]/10 rounded-full blur-3xl"></div>
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <Image 
                  src="/PhotoAI_results.png" 
                  alt="SneakyGuy Results" 
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#ff4500] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to 10x Your Reddit Strategy?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of businesses finding success on Reddit</p>
          <Button 
            onClick={() => router.push('/login')}
            size="lg"
            variant="secondary"
            className="bg-white text-[#ff4500] hover:bg-gray-100 px-8 py-7 text-lg rounded-full"
          >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-6 text-sm opacity-75">No credit card required • 14-day free trial • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}
