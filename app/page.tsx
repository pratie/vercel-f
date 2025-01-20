'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Target, Brain, Filter, ChevronRight, MessageSquare, Rocket } from 'lucide-react';
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff3f0] to-white/0 h-[500px] pointer-events-none" />
        
        <main className="relative">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-20 pb-16 text-center">
              {/* Early Access Badge */}
              <div className="inline-flex items-center bg-white rounded-full px-4 py-2 mb-8 shadow-sm border border-gray-100">
                <Rocket className="h-4 w-4 text-[#ff4500] mr-2" />
                <span className="text-sm font-semibold text-[#ff4500]">⚡️ Early Access: First 20 Users Only</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-[#ff4500] to-gray-900 max-w-4xl mx-auto">
                Strike Reddit Gold
                <br />
                <span className="text-4xl sm:text-5xl md:text-6xl">Before Anyone Else</span>
              </h1>

              {/* Subheadline */}
              <div className="max-w-2xl mx-auto mb-16">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-xl sm:text-2xl font-medium">Turn Reddit Insights Into</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#ff4500]">Real Opportunities</span>
                </div>
                
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                  Your <span className="font-semibold">AI-powered Reddit detective</span> that spots golden opportunities others miss.
                </p>
              </div>

              {/* Feature List */}
              <div className="max-w-3xl mx-auto mb-20">
                <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10 shadow-sm">
                  <div className="grid gap-8 sm:gap-12">
                    <div className="flex items-start gap-6">
                      <div className="h-12 w-12 rounded-xl bg-[#fff3f0] flex items-center justify-center flex-shrink-0">
                        <Target className="h-6 w-6 text-[#ff4500]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Emerging market trends</h3>
                        <p className="text-gray-600">Be the first to spot opportunities before they go mainstream</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="h-12 w-12 rounded-xl bg-[#fff3f0] flex items-center justify-center flex-shrink-0">
                        <Brain className="h-6 w-6 text-[#ff4500]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Perfect-fit leads</h3>
                        <p className="text-gray-600">Connect with users actively seeking solutions like yours</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="h-12 w-12 rounded-xl bg-[#fff3f0] flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="h-6 w-6 text-[#ff4500]" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Brand & competitor insights</h3>
                        <p className="text-gray-600">Stay ahead with real-time discussion monitoring</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-50/0 to-gray-50 rounded-3xl" />
                  <div className="relative rounded-3xl overflow-hidden border border-gray-200/60 shadow-2xl">
                    <div className="aspect-[16/9] relative">
                      <Image
                        src="/dash_design.png"
                        alt="Reddit Tracker Dashboard"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        priority
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 pointer-events-none border border-gray-100 rounded-3xl" />
                </div>
              </div>

              {/* Value Proposition Section */}
              <div className="py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                      Save 50+ Hours Monthly on Lead Generation
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      See how SNEAKYGUY automates your Reddit lead generation process
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Manual Process Card */}
                    <div className="bg-red-50 rounded-2xl p-8 border border-red-100">
                      <div className="flex items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">To find customers</h3>
                        <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium mx-2">
                          manually
                        </span>
                        <span className="text-gray-900">you need:</span>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mt-0.5">
                            1
                          </div>
                          <p className="text-gray-700 flex-1">
                            Monitor each social network every few hours, searching for keywords related to your product
                            <span className="text-gray-500 block mt-1">(15 - 30 min)</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mt-0.5">
                            2
                          </div>
                          <p className="text-gray-700 flex-1">
                            Read every mention and analyze whether you can offer your product
                            <span className="text-gray-500 block mt-1">(15 - 30 min)</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mt-0.5">
                            3
                          </div>
                          <p className="text-gray-700 flex-1">
                            Write a personal text for each suitable mention in which your product will be mentioned
                            <span className="text-gray-500 block mt-1">(30 - 60 min)</span>
                          </p>
                        </div>
                        <div className="mt-8 border-t border-red-100 pt-6">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">Total:</span>
                            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium mx-2">
                              1 - 2 hours per day
                            </span>
                            <span className="text-gray-700">for 1 project</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SNEAKYGUY Process Card */}
                    <div className="bg-green-50 rounded-2xl p-8 border border-green-100">
                      <div className="flex items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">To get leads using</h3>
                        <span className="bg-[#ff4500] text-white px-3 py-1 rounded-full text-sm font-medium mx-2">
                          SNEAKYGUY
                        </span>
                        <span className="text-gray-900">you need:</span>
                      </div>
                      
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mt-0.5">
                            ✓
                          </div>
                          <p className="text-gray-700 flex-1">
                            Create a project and add keywords
                            <span className="text-gray-500 block mt-1">(AI will suggest suitable keywords for your product)</span>
                          </p>
                        </div>
                        <div className="mt-8 border-t border-green-100 pt-6">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">Total:</span>
                            <span className="bg-[#ff4500] text-white px-3 py-1 rounded-full text-sm font-medium mx-2">
                              2 minutes one time
                            </span>
                            <span className="text-gray-700">for 1 project</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="text-center mt-16">
                    <div className="inline-flex flex-col items-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-8">
                        You will <span className="bg-gray-800 text-white px-4 py-1 rounded-full mx-2">save 30 - 60 hours monthly</span> for each project!
                      </h3>
                      <Button
                        onClick={() => router.push('/login')}
                        className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-8 py-4 rounded-full text-lg font-semibold"
                      >
                        Get Started Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="py-20 bg-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-12 text-center">
                    How It Works
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                      <div className="mb-4 h-12 w-12 rounded-xl bg-[#fff3f0] flex items-center justify-center">
                        <span className="text-[#ff4500] font-semibold text-xl">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your Project</h3>
                      <p className="text-gray-600">Describe your business, and our AI will generate targeted keywords and relevant subreddits.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                      <div className="mb-4 h-12 w-12 rounded-xl bg-[#fff3f0] flex items-center justify-center">
                        <span className="text-[#ff4500] font-semibold text-xl">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Discovery</h3>
                      <p className="text-gray-600">Our AI continuously monitors Reddit, finding and scoring relevant opportunities.</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100">
                      <div className="mb-4 h-12 w-12 rounded-xl bg-[#fff3f0] flex items-center justify-center">
                        <span className="text-[#ff4500] font-semibold text-xl">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Engagement</h3>
                      <p className="text-gray-600">Get AI-generated reply suggestions that naturally promote your brand.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Preview */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-gray-50/0 to-gray-50 rounded-3xl" />
                  <div className="relative rounded-3xl overflow-hidden border border-gray-200/60 shadow-2xl">
                    <div className="aspect-[16/9] relative">
                      <Image
                        src="/results.png"
                        alt="Reddit Tracker Results"
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        priority
                      />
                    </div>
                  </div>
                  <div className="absolute inset-0 pointer-events-none border border-gray-100 rounded-3xl" />
                </div>
              </div>

              {/* Final CTA Section */}
              <div className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">
                    Ready to Automate Your Reddit Lead Generation?
                  </h2>
                  <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                    Join the early access program and start saving 30-60 hours monthly on your lead generation efforts.
                  </p>
                  <Button
                    onClick={() => router.push('/login')}
                    className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-8 py-4 rounded-full text-lg font-semibold"
                  >
                    Get Early Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Social Proof Section - Less prominent */}
              <div className="py-20 bg-gray-50">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-semibold text-gray-900 text-center mb-12">
                    What Early Users Are Saying
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Testimonial 1 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-6">
                        <div className="h-14 w-14 rounded-full bg-[#fff3f0] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#ff4500] font-bold text-xl">JM</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">James Miller</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fff3f0] text-[#ff4500]">
                              Verified User
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Growth Lead @ TechStartup</p>
                          <blockquote className="text-gray-700 leading-relaxed italic">
                            "Found 3 enterprise clients in our first week. The AI suggestions are surprisingly accurate."
                          </blockquote>
                        </div>
                      </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-6">
                        <div className="h-14 w-14 rounded-full bg-[#fff3f0] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#ff4500] font-bold text-xl">SK</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">Sarah Kim</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fff3f0] text-[#ff4500]">
                              Verified User
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Reddit Marketing Consultant</p>
                          <blockquote className="text-gray-700 leading-relaxed italic">
                            "This tool does the work of 3 VA's. Saves me hours of manual Reddit monitoring."
                          </blockquote>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="inline-flex flex-col items-center bg-white border-2 border-[#ff4500] rounded-2xl p-8 sm:p-10">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl text-gray-400 line-through font-medium">$120</span>
                    <span className="text-5xl sm:text-6xl font-bold text-[#ff4500]">$39</span>
                    <div className="bg-[#ff4500] px-4 py-2 rounded-full">
                      <span className="text-white text-sm font-semibold">Save 67%</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-base font-medium text-gray-900">One-time Payment • Lifetime Access</span>
                    <span className="text-sm font-semibold text-[#ff4500]">🔥 Only 16 spots remaining</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 mb-12">
                  <Button 
                    size="lg"
                    className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all group w-full sm:w-auto"
                    onClick={handleStartFreeTrial}
                  >
                    Start Mining Reddit Gold
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="border-2 px-8 py-6 text-lg rounded-xl hover:bg-gray-50 transition-all w-full sm:w-auto"
                    onClick={handleLiveDemo}
                  >
                    See How It Works
                  </Button>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 max-w-2xl mx-auto">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm">5-min setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    <span className="text-sm">No credit card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    <span className="text-sm">Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
