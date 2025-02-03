'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Target, Brain, Filter, ChevronRight, MessageSquare, Rocket, Users, Star, Shield, Sparkles, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import Image from 'next/image';
import { FreeAccessMessage } from './components/FreeAccessMessage';
import Link from 'next/link';

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
      {/* Early Adopter Offer Banner */}
      <div className="bg-[#ff4500] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="font-medium whitespace-nowrap">Early Access Offer:</span>
            </div>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-medium">4 spots left</span>
            </span>
            <span className="font-bold whitespace-nowrap">$39</span>
            <span className="hidden sm:inline opacity-75 mx-1">•</span>
            <span className="hidden sm:inline whitespace-nowrap">One-time Payment</span>
            <span className="hidden sm:inline opacity-75 mx-1">•</span>
            <span className="hidden sm:inline whitespace-nowrap">Lifetime Access</span>
            {/* Mobile version of additional info */}
            <div className="w-full sm:hidden text-center mt-1 text-xs">
              <span>One-time Payment • Lifetime Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fff3f0] to-white/0 h-[500px] pointer-events-none" />
        
        <main className="relative">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-16 sm:pt-20 pb-16 text-center">
              {/* Target Audience Badge */}
              <div className="flex justify-center mb-6 sm:mb-8 px-4">
                <div className="inline-block bg-white/90 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-sm border border-[#ff4500]/10">
                  <p className="text-sm sm:text-base text-gray-700 font-medium whitespace-nowrap">For B2B SaaS Companies & Growth Teams</p>
                </div>
              </div>

              <div className="max-w-[750px] mx-auto px-4 sm:px-6 text-center">
                <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 mb-8 sm:mb-12">
                  Turn Reddit Discussions Into
                  <div className="mt-4 sm:mt-6">
                    <span className="bg-gradient-to-r from-[#ff4500] to-[#ff6634] bg-clip-text text-transparent inline-block text-lg sm:text-2xl lg:text-3xl font-semibold">
                      Qualified B2B Leads
                    </span>
                  </div>
                </h1>
              </div>

              {/* Features Section */}
              <div className="max-w-[850px] mx-auto px-4 mb-8 sm:mb-16">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12">
                  <div className="flex items-start sm:items-center gap-4 text-base sm:text-lg text-gray-600 max-w-[300px] sm:max-w-none group bg-white/80 p-5 rounded-xl border border-[#ff4500]/10 hover:border-[#ff4500]/20 transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fff3f0] to-white flex items-center justify-center flex-shrink-0 shadow-sm border border-[#ff4500]/10 group-hover:border-[#ff4500]/20 transition-all duration-200">
                      <MessageSquare className="h-6 w-6 text-[#ff4500]" />
                    </div>
                    <span className="text-left sm:text-center group-hover:text-gray-900 transition-colors duration-200">Find relevant Reddit discussions to promote your product with AI-powered relevancy scoring</span>
                  </div>
                  
                  <div className="hidden sm:flex items-center">
                    <span className="text-[#ff4500] text-2xl font-medium animate-pulse px-2">+</span>
                  </div>
                  
                  <div className="flex items-start sm:items-center gap-4 text-base sm:text-lg text-gray-600 max-w-[300px] sm:max-w-none group bg-white/80 p-5 rounded-xl border border-[#ff4500]/10 hover:border-[#ff4500]/20 transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fff3f0] to-white flex items-center justify-center flex-shrink-0 shadow-sm border border-[#ff4500]/10 group-hover:border-[#ff4500]/20 transition-all duration-200">
                      <Brain className="h-6 w-6 text-[#ff4500]" />
                    </div>
                    <span className="text-left sm:text-center group-hover:text-gray-900 transition-colors duration-200">Get AI-crafted response suggestions to naturally promote your product</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center mb-8 sm:mb-12 px-4">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#ff4500] to-[#ff6634] hover:from-[#ff4500] hover:to-[#ff4500] text-white px-10 sm:px-14 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Early Access
                  <ArrowRight 
                    className="ml-3 h-5 w-5 inline-block"
                  />
                </Button>
              </div>

              {/* Pricing Tag */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gray-50 border border-gray-200">
                  <span className="text-gray-700">One-time Payment</span>
                  <span className="text-[#ff4500] font-bold">$39</span>
                  <span className="text-gray-700">•</span>
                  <span className="text-gray-700">Lifetime Access</span>
                </div>
              </div>

              {/* Dashboard Preview */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
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

              {/* Customer Achievements Section */}
              <div className="py-12 bg-gray-50">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-xl text-gray-600 text-center mb-8">
                    What our customers achieve with SNEAKYGUY
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white p-8 rounded-xl">
                      <div className="text-[2.5rem] font-bold text-[#ff4500] mb-3">3.5x</div>
                      <p className="text-gray-600">More qualified leads compared to traditional prospecting</p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-xl">
                      <div className="text-[2.5rem] font-bold text-[#ff4500] mb-3">50+</div>
                      <p className="text-gray-600">Hours saved monthly on manual lead generation</p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-xl">
                      <div className="text-[2.5rem] font-bold text-[#ff4500] mb-3">89%</div>
                      <p className="text-gray-600">Higher response rate from Reddit-sourced leads</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Proposition Section */}
              <div className="py-12 sm:py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                      Automate Your Reddit Lead Generation
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                      See how SNEAKYGUY helps you find and convert qualified leads from Reddit discussions
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto">
                    {/* Manual Process Card */}
                    <div className="bg-red-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-red-100">
                      <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-2 sm:gap-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">To find customers</h3>
                        <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium sm:mx-2 inline-block sm:inline">
                          manually
                        </span>
                        <span className="text-gray-900">you need:</span>
                      </div>
                      
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 text-red-600 mt-0.5">
                            1
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 flex-1">
                            Monitor each social network every few hours, searching for keywords related to your product
                            <span className="text-gray-500 block mt-1 text-sm">(15 - 30 min)</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 text-red-600 mt-0.5">
                            2
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 flex-1">
                            Read every mention and analyze whether you can offer your product
                            <span className="text-gray-500 block mt-1 text-sm">(15 - 30 min)</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 text-red-600 mt-0.5">
                            3
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 flex-1">
                            Write a personal text for each suitable mention in which your product will be mentioned
                            <span className="text-gray-500 block mt-1 text-sm">(30 - 60 min)</span>
                          </p>
                        </div>
                        <div className="mt-8 border-t border-red-100 pt-6">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">Total:</span>
                            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium mx-2">
                              1 - 2 hours per day
                            </span>
                            <span className="text-gray-600">for 1 project</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SNEAKYGUY Process Card */}
                    <div className="bg-green-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-green-100">
                      <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-2 sm:gap-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">To get leads using</h3>
                        <span className="bg-[#ff4500] text-white px-3 py-1 rounded-full text-sm font-medium sm:mx-2 inline-block sm:inline">
                          SNEAKYGUY
                        </span>
                        <span className="text-gray-900">you need:</span>
                      </div>
                      
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 text-green-600 mt-0.5">
                            ✓
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 flex-1">
                            Create a project and add keywords
                            <span className="text-gray-500 block mt-1 text-sm">(AI will suggest suitable keywords for your product)</span>
                          </p>
                        </div>
                        <div className="mt-8 border-t border-green-100 pt-6">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">Total:</span>
                            <span className="bg-[#ff4500] text-white px-3 py-1 rounded-full text-sm font-medium mx-2">
                              2 minutes one time
                            </span>
                            <span className="text-gray-600">per project</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="text-center mt-8 sm:mt-12">
                    <div className="inline-flex flex-col items-center">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8 px-4">
                        You will <span className="bg-gray-800 text-white px-3 sm:px-4 py-1 rounded-full mx-2 whitespace-nowrap">save 30 - 60 hours monthly</span> for each project!
                      </h3>
                      <Button
                        onClick={() => router.push('/login')}
                        className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold w-full sm:w-auto"
                      >
                        Get Started Now
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparison Section */}
              <div className="max-w-[1000px] mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Manual Process */}
                  <div className="bg-[#fff1f0] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="px-3 py-1 rounded-full bg-gray-800/90 text-white text-sm">
                        manually
                      </div>
                      <h3 className="text-lg font-medium">Finding customers takes</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff45001a] text-[#ff4500] flex items-center justify-center text-sm">1</span>
                        <p className="text-gray-700">Monitor social networks for relevant discussions about your product
                          <span className="block text-sm text-gray-500 mt-1">15-30 min</span>
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff45001a] text-[#ff4500] flex items-center justify-center text-sm">2</span>
                        <p className="text-gray-700">Review each mention to assess promotion opportunities
                          <span className="block text-sm text-gray-500 mt-1">15-30 min</span>
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ff45001a] text-[#ff4500] flex items-center justify-center text-sm">3</span>
                        <p className="text-gray-700">Craft personalized responses for each opportunity
                          <span className="block text-sm text-gray-500 mt-1">30-60 min</span>
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#ff4500]/10">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">Total:</span>
                          <span className="px-3 py-1 rounded-full bg-gray-800/90 text-white text-sm">1-2 hours per day</span>
                          <span className="text-gray-600">per project</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SneakyGuy Process */}
                  <div className="bg-[#f0fff4] rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="px-3 py-1 rounded-full bg-[#ff4500] text-white text-sm">
                        SNEAKYGUY
                      </div>
                      <h3 className="text-lg font-medium">With us, you just need</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✓</span>
                        <div>
                          <p className="text-gray-700">Create a project and add keywords</p>
                          <p className="text-sm text-gray-500 mt-1">AI suggests relevant keywords for your product</p>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-green-100">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-medium">Total:</span>
                          <span className="px-3 py-1 rounded-full bg-[#ff4500] text-white text-sm">2 minutes one time</span>
                          <span className="text-gray-600">per project</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Savings Summary */}
                <div className="text-center mt-8">
                  <div className="inline-flex items-center gap-2 bg-gray-800/90 text-white px-4 py-2 rounded-full">
                    <span className="font-medium">You save 30-60 hours monthly</span>
                    <span>for each project!</span>
                  </div>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="py-12 sm:py-20 bg-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10 sm:mb-16">
                    How It Works
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
                    <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="mb-4 h-12 w-12 rounded-xl bg-[#fff3f0] flex items-center justify-center">
                        <span className="text-[#ff4500] font-semibold text-xl">1</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Create Your Project</h3>
                      <p className="text-sm sm:text-base text-gray-600">Describe your business, and our AI will generate targeted keywords and relevant subreddits.</p>
                    </div>
                    <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="mb-4 h-12 w-12 rounded-xl bg-[#fff3f0] flex items-center justify-center">
                        <span className="text-[#ff4500] font-semibold text-xl">2</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">AI-Powered Discovery</h3>
                      <p className="text-sm sm:text-base text-gray-600">Our AI continuously monitors Reddit, finding and scoring relevant opportunities.</p>
                    </div>
                    <div className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="mb-4 h-12 w-12 rounded-xl bg-[#fff3f0] flex items-center justify-center">
                        <span className="text-[#ff4500] font-semibold text-xl">3</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Smart Engagement</h3>
                      <p className="text-sm sm:text-base text-gray-600">Get AI-generated reply suggestions that naturally promote your brand.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Preview */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
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

              {/* Early Adopter Benefits */}
              <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
                  Early Adopter Benefits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-[#ff4500]/10 hover:border-[#ff4500]/20 transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fff3f0] to-white mx-auto mb-4 flex items-center justify-center">
                      <Star className="h-6 w-6 text-[#ff4500]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Priority Feature Requests</h3>
                    <p className="text-gray-600">Your feature requests get top priority in our development roadmap. Help shape the future of SNEAKYGUY.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-[#ff4500]/10 hover:border-[#ff4500]/20 transition-all duration-200">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#fff3f0] to-white mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-6 w-6 text-[#ff4500]" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Direct Access to Founders</h3>
                    <p className="text-gray-600">Get direct access to our team. Your feedback is invaluable in making SNEAKYGUY better for everyone.</p>
                  </div>
                </div>
              </div>

              {/* Final CTA Section */}
              <div className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                    Ready to Automate Your Reddit Lead Generation?
                  </h2>
                  <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto px-4 sm:px-0">
                    Join the early access program and start saving 30-60 hours monthly on your lead generation efforts.
                  </p>
                  <Button
                    onClick={() => router.push('/login')}
                    className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold w-full sm:w-auto"
                  >
                    Get Early Access
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>

              {/* Social Proof Section - Less prominent */}
              <div className="py-16 bg-gray-50">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-semibold text-gray-900 text-center mb-10">
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
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="text-4xl font-bold text-gray-900 line-through opacity-50">$120</div>
                    <div className="text-5xl font-bold text-[#ff4500]">$39</div>
                    <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Save 67%
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 text-lg text-gray-700">
                      <span>One-time Payment</span>
                      <span className="text-gray-400">•</span>
                      <span>Lifetime Access</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-lg">🔥</span>
                      <span>Only 4 spots remaining</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push('/login')}
                    className="w-full sm:w-auto bg-gradient-to-r from-[#ff4500] to-[#ff6634] hover:from-[#ff4500] hover:to-[#ff4500] text-white px-10 sm:px-14 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-medium transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Get Early Access
                    <ArrowRight className="ml-3 h-5 w-5 inline-block" />
                  </Button>
                </div>
              </div>

              {/* Quirky Free Access Message */}
              <div className="mt-12 bg-[#fff3f0] rounded-2xl p-8 max-w-2xl mx-auto">
                <FreeAccessMessage />
              </div>

              {/* Footer */}
              <footer className="border-t border-gray-200 bg-white mt-16">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <div className="flex items-center gap-2">
                      <Image 
                        src="/logo.png"
                        alt="SneakyGuy"
                        width={24}
                        height={24}
                        className="w-6 h-6"
                      />
                      <span className="text-gray-600 text-sm">
                        &copy; {new Date().getFullYear()} SneakyGuy. All rights reserved.
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <Link 
                        href="/privacy"
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Privacy Policy
                      </Link>
                      <Link 
                        href="/terms"
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Terms of Use
                      </Link>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
