'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Target, Brain, Filter, ChevronRight, MessageSquare, Rocket, Users, Star, Shield, Sparkles, Mail } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import Image from 'next/image';
import { FreeAccessMessage } from './components/FreeAccessMessage';

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
              {/* Background Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 via-white to-white pointer-events-none"></div>
              
              {/* Floating Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-4 right-1/4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute top-1/4 -left-12 w-32 h-32 bg-[#ff4500]/10 rounded-full blur-2xl animate-pulse delay-300"></div>
                <div className="absolute bottom-1/4 right-0 w-40 h-40 bg-orange-400/10 rounded-full blur-2xl animate-pulse delay-700"></div>
              </div>

              {/* Target Audience Badge */}
              <div className="flex justify-center mb-8 sm:mb-12 px-4 animate-fade-in relative">
                <div className="inline-block bg-gradient-to-r from-white/80 via-white to-orange-50/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-orange-200/30 hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-[#ff4500]/5 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <p className="text-[15px] sm:text-base text-gray-800 font-medium whitespace-nowrap bg-gradient-to-r from-gray-800 to-gray-600 hover:to-orange-600 bg-clip-text hover:text-transparent transition-all duration-300 relative">
                    For B2B SaaS Companies & Growth Teams
                  </p>
                </div>
              </div>

              <div className="max-w-[800px] mx-auto px-4 sm:px-6 text-center relative z-10">
                <h1 className="text-[28px] sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 mb-6 sm:mb-8 leading-[1.15] animate-fade-in-up">
                  <span className="inline-block mb-2">Turn Reddit Discussions Into</span>{" "}
                  <div className="mt-1 sm:mt-0 sm:inline relative">
                    <span className="bg-gradient-to-r from-orange-500 via-[#ff4500] to-[#ff6634] bg-clip-text text-transparent animate-gradient-x relative inline-block">
                      Qualified B2B Leads
                      <span className="absolute -inset-1 bg-orange-500/20 blur-xl opacity-50"></span>
                    </span>
                  </div>
                </h1>

                <p className="text-[15px] leading-relaxed sm:text-lg text-gray-600 mb-10 sm:mb-12 max-w-2xl mx-auto animate-fade-in-up delay-100">
                  AI-powered tool that finds and qualifies B2B leads from Reddit discussions, saving you{" "}
                  <span className="font-semibold bg-gradient-to-r from-orange-500 to-[#ff4500] bg-clip-text text-transparent inline-block hover:scale-110 transition-transform duration-300 cursor-default">
                    50+ hours monthly
                  </span>{" "}
                  on manual prospecting.
                </p>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-6 mb-12 sm:mb-16 animate-fade-in-up delay-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-orange-100/50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">500+ Active Users</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-orange-100/50 flex items-center justify-center">
                      <Star className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">4.8/5 Rating</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-orange-100/50 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="text-sm font-medium">GDPR Compliant</span>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="max-w-[800px] mx-auto px-4 mb-12 sm:mb-16 relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
                  <div className="flex items-start sm:items-center gap-4 text-[15px] leading-relaxed sm:text-lg text-gray-600 max-w-[280px] sm:max-w-none group bg-gradient-to-br from-white via-white to-orange-50/30 p-5 rounded-xl border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:scale-105 hover:shadow-orange-200/50 shadow-lg animate-fade-in-left">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-[#ff4500] to-[#ff6634] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <MessageSquare className="h-6 w-6 text-white group-hover:rotate-6 transition-transform duration-300" />
                    </div>
                    <span className="text-left sm:text-center group-hover:text-gray-900 transition-colors duration-200">Find conversations to mention your product with AI relevancy score</span>
                  </div>
                  
                  <div className="flex sm:hidden items-center">
                    <span className="text-transparent bg-gradient-to-r from-orange-500 to-[#ff4500] bg-clip-text text-2xl font-medium animate-bounce px-2">+</span>
                  </div>
                  
                  <div className="hidden sm:flex items-center">
                    <span className="text-transparent bg-gradient-to-r from-orange-500 to-[#ff4500] bg-clip-text text-3xl font-medium animate-bounce px-2">+</span>
                  </div>
                  
                  <div className="flex items-start sm:items-center gap-4 text-[15px] leading-relaxed sm:text-lg text-gray-600 max-w-[280px] sm:max-w-none group bg-gradient-to-br from-white via-white to-orange-50/30 p-5 rounded-xl border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:scale-105 hover:shadow-orange-200/50 shadow-lg animate-fade-in-right">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-[#ff4500] to-[#ff6634] flex items-center justify-center flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <Brain className="h-6 w-6 text-white group-hover:rotate-6 transition-transform duration-300" />
                    </div>
                    <span className="text-left sm:text-center group-hover:text-gray-900 transition-colors duration-200">AI-crafted reply suggestions</span>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center mb-12 sm:mb-20 px-4 animate-fade-in-up delay-300 relative z-10">
                <button
                  onClick={() => router.push('/signup')}
                  className="group relative w-full sm:w-auto bg-gradient-to-r from-orange-500 via-[#ff4500] to-[#ff6634] hover:from-[#ff4500] hover:to-[#ff6634] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-medium transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl max-w-[280px] hover:border-orange-300/50 border border-orange-200/30 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine"></span>
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/50 to-[#ff6634]/50 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
                  <span className="relative flex items-center justify-center gap-3">
                    Find leads
                    <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>

              {/* Customer Achievements Section */}
              <div className="py-16 bg-gray-50">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-xl text-gray-600 text-center mb-12">
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
              <div className="py-12 sm:py-20 bg-gradient-to-b from-white to-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-10 sm:mb-16">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                      Save 50+ Hours Monthly on Lead Generation
                    </h2>
                    <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
                      See how SNEAKYGUY automates your Reddit lead generation process
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
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mt-0.5">
                            1
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 flex-1">
                            Monitor each social network every few hours, searching for keywords related to your product
                            <span className="text-gray-500 block mt-1 text-sm">(15 - 30 min)</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mt-0.5">
                            2
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 flex-1">
                            Read every mention and analyze whether you can offer your product
                            <span className="text-gray-500 block mt-1 text-sm">(15 - 30 min)</span>
                          </p>
                        </div>
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-red-100 text-red-600 mt-0.5">
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
                            <span className="text-gray-700">for 1 project</span>
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
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-green-100 text-green-600 mt-0.5">
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
                            <span className="text-gray-700">for 1 project</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className="text-center mt-10 sm:mt-16">
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

              {/* Quirky Free Access Message */}
              <div className="mt-12 bg-[#fff3f0] rounded-2xl p-8 max-w-2xl mx-auto">
                <FreeAccessMessage />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
