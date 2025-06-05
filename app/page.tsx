'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Target, Brain, Filter, ChevronRight, MessageSquare, Rocket, Users, Star, Shield, Sparkles, Mail, Check, Twitter, Linkedin } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import Image from 'next/image';
import { FreeAccessMessage } from './components/FreeAccessMessage';
import Link from 'next/link';
import { useRef } from 'react';
import confetti from 'canvas-confetti'; // You may need to install this package
import SocialProof from '@/components/SocialProof';
import { usePathname } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const ctaRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (user && pathname === '/') {
      router.push('/projects');
    }
  }, [user, router, pathname]);

  const handleGetStarted = () => {
    // Confetti burst for delight
    if (ctaRef.current) {
      const rect = ctaRef.current.getBoundingClientRect();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight },
      });
    }
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="SneakyGuy Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="font-bold text-xl text-gray-900">Sneakyguy</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-[#ff4500] font-medium">
                How It Works
              </a>
              <a href="#features" className="text-gray-600 hover:text-[#ff4500] font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-[#ff4500] font-medium">
                Pricing
              </a>
            </nav>
            
            <Button
              className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white"
              onClick={() => router.push('/login')}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hot Selling Feature Banner */}
      <div className="w-full flex justify-center mt-2 mb-2">
        <div className="bg-[#ff4500] text-white rounded-full px-4 sm:px-6 py-1.5 sm:py-2 shadow-md max-w-xl w-auto text-center mx-2">
          <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
            Customizable AI comments that reflect your brand identity
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Subtle background illustration */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg width="100%" height="100%" className="absolute opacity-10" style={{top:0,left:0}}>
            <circle cx="30%" cy="20%" r="180" fill="#ff4500" fillOpacity="0.07" />
            <circle cx="80%" cy="80%" r="120" fill="#ff4500" fillOpacity="0.08" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-12 z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center animate-fade-in-up">
              <div className="w-full flex flex-col items-center lg:items-start">

                
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-4 animate-slide-up text-left w-full">
                  Find Reddit Leads<br />
                  <span className="text-[#ff4500] block mt-2">While You Sleep</span>
                </h1>
                
                <div className="mb-5 w-full">
                  <p className="text-gray-600 text-sm sm:text-lg font-normal mb-3 text-left">
                    The easiest way to discover, engage, and convert leads from Reddit—powered by AI, built for modern teams.
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-100 mr-3 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      </span>
                      <span className="text-gray-800 text-sm sm:text-lg">Instantly spot high-intent leads with AI scoring</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-100 mr-3 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      </span>
                      <span className="text-gray-800 text-sm sm:text-lg">See what’s relevant—no noise, just signals</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-100 mr-3 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      </span>
                      <span className="text-gray-800 text-sm sm:text-lg">Get daily & weekly digests—never miss a hot lead</span>
                    </div>
                    <div className="flex items-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-green-100 mr-3 sm:mr-4 h-6 w-6 sm:h-8 sm:w-8">
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      </span>
                      <span className="text-gray-800 text-sm sm:text-lg">AI replies that gently pitch your product, adding value</span>
                    </div>

                  </div>
                </div>

                <div className="mt-6 w-full flex sm:justify-center lg:justify-start">
                  <Button
                    ref={ctaRef}
                    className="bg-[#ff4500] hover:bg-[#ff6d3f] text-white px-8 py-4 rounded-full text-lg font-medium w-full sm:w-auto shadow-lg shadow-[#ff4500]/20 transition-transform duration-200 hover:scale-105"
                    onClick={handleGetStarted}
                  >
                    Find Leads Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6 relative animate-fade-in">
              <div className="relative mx-auto w-full rounded-2xl shadow-lg overflow-hidden bg-white">
                <div style={{ position: 'relative', paddingBottom: '51.67%', height: 0 }}>
                  <iframe 
                    src="https://www.loom.com/embed/01050bb0c0584256be51ddd489787480?sid=e4f38ddc-3d39-4627-8a78-b44f940d2b83" 
                    frameBorder="0" 
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    title="Sneakyguy Demo"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
          {/* --- Scroll Down Indicator for Mobile --- */}
          <div className="block lg:hidden absolute left-1/2 transform -translate-x-1/2 bottom-2 animate-bounce z-20">
            <span className="flex flex-col items-center text-xs text-gray-400">
              <svg width="24" height="24" fill="none" stroke="#ff4500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>
              Scroll Down
            </span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How SneakyGuy Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform automates the entire Reddit lead generation process in three simple steps
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[#ff4500]/0 via-[#ff4500] to-[#ff4500]/0 z-0"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="bg-[#fff3f0] rounded-full w-12 h-12 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <span className="text-[#ff4500] font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left">Set Up Your Keywords</h3>
                <p className="text-gray-600 mb-6 text-center lg:text-left">
                  Enter your business keywords and select relevant subreddits. SneakyGuy will monitor these 24/7 for potential leads.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="bg-white rounded border border-gray-200 p-3 text-sm font-mono">
                    <span className="text-purple-600">keywords</span>: [<span className="text-green-600">"saas tool"</span>, <span className="text-green-600">"lead generation"</span>]
                  </div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="bg-[#fff3f0] rounded-full w-12 h-12 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <span className="text-[#ff4500] font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left">AI Identifies Opportunities</h3>
                <p className="text-gray-600 mb-6 text-center lg:text-left">
                  Our AI analyzes Reddit posts and comments to find discussions where your product could be a solution.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="bg-white rounded border border-gray-200 p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-[#ff4500] mt-0.5" />
                      <span className="text-gray-700">Analyzing post: "Looking for a tool to find leads on social media..."</span>
                    </div>
                    <div className="mt-2 ml-6 text-green-600 font-medium">Match found! (92% relevance)</div>
                  </div>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="bg-[#fff3f0] rounded-full w-12 h-12 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                  <span className="text-[#ff4500] font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left">Generate & Post Responses</h3>
                <p className="text-gray-600 mb-6 text-center lg:text-left">
                  SneakyGuy creates personalized responses that subtly promote your product while providing genuine value.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="bg-white rounded border border-gray-200 p-3 text-sm">
                    <div className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 mr-2"></div>
                      <div className="text-gray-700">
                        "I've been using SneakyGuy for this exact purpose and it's been a game-changer for finding leads..."
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button
              onClick={() => router.push('/login')}
              className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-8 py-3 text-lg font-medium"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <SocialProof />

      {/* Special Offer Section - With Feature Breakdown */}
      <div className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#ff4500] to-[#ff6b3d] rounded-2xl p-6 sm:p-8 text-white">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 text-sm mb-4">
                <span className="text-lg">🔥</span>
                <span>Limited Time Launch Offer</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Get Lifetime Access Today</h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <div className="text-lg">
                  <span className="line-through opacity-75 text-base">$120/month</span>
                  <span className="font-bold text-4xl ml-2">$39</span>
                  <span className="ml-2 text-sm bg-white/10 rounded-full px-3 py-1">Save 67%</span>
                </div>
                <div className="h-4 w-px bg-white/20 hidden sm:block"></div>
                <div className="text-sm">
                  
                </div>
              </div>
            </div>

            {/* Feature List */}
            <div className="bg-white/5 rounded-xl p-6 mb-6">
              <h4 className="font-semibold mb-4 text-center">What's Included in Lifetime Access:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>300 Replies/month</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Unlimited Business-specific Keywords</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>15 Relevant Subreddits relevant to your business</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>Unlimited Reply Generation</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-white/80 text-sm mb-6">One-time payment • No recurring fees • All future updates included</p>
              <Button
                onClick={() => router.push('/login')}
                className="bg-white text-[#ff4500] hover:bg-white/90 font-semibold px-8 py-3"
              >
                Claim Your Lifetime Access
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why SneakyGuy?</h2>
            <p className="text-lg text-gray-600">Everything you need to turn Reddit into your best lead source.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-center">
              <Brain className="mx-auto h-10 w-10 text-[#ff4500] mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Replies</h3>
              <p className="text-gray-600">Get smart, context-aware replies generated for every lead opportunity. Review and edit before posting.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-center">
              <Target className="mx-auto h-10 w-10 text-[#ff4500] mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Keyword & Subreddit Suggestions</h3>
              <p className="text-gray-600">We suggest the best keywords and subreddits for your business, so you never miss a relevant conversation.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-center">
              <Shield className="mx-auto h-10 w-10 text-[#ff4500] mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Build Your Brand Presence</h3>
              <p className="text-gray-600">Connect your Reddit account and manage your brand’s presence on Reddit from one place.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Savings Message */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-full text-base">
          <span className="font-medium">You save 30-60 hours monthly</span>
          <span className="text-gray-200">for each project!</span>
        </div>
      </div>

      {/* Value Proposition Section */}
      <div className="py-8 sm:py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 mb-4 sm:mb-6">
              See how SNEAKYGUY helps you 
               and convert qualified leads from Reddit discussions
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Manual Process Card */}
            <div className="relative bg-[#fff4f2] rounded-2xl p-4 sm:p-6">
              <div className="absolute -top-4 left-4 sm:left-6 bg-white px-3 sm:px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">manually</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">Finding customers takes</span>
                </div>
              </div>
              
              <div className="relative mt-8">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fff3f0] flex items-center justify-center text-[#ff4500] font-medium">1</span>
                  <div>
                    <p className="text-gray-700">Monitor social networks for relevant discussions about your product</p>
                    <p className="text-gray-500 text-sm mt-1">15-30 min</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fff3f0] flex items-center justify-center text-[#ff4500] font-medium">2</span>
                  <div>
                    <p className="text-gray-700">Review each mention to assess promotion opportunities</p>
                    <p className="text-gray-500 text-sm mt-1">15-30 min</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#fff3f0] flex items-center justify-center text-[#ff4500] font-medium">3</span>
                  <div>
                    <p className="text-gray-700">Craft personalized responses for each opportunity</p>
                    <p className="text-gray-500 text-sm mt-1">30-60 min</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#ff4500]/10">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">Total:</span>
                    <span className="text-[#ff4500] font-medium">1-2 hours per day</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-gray-700">per project</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SneakGuy Process Card */}
            <div className="relative bg-[#f0fdf4] rounded-2xl p-4 sm:p-6">
              <div className="absolute -top-4 left-4 sm:left-6 bg-white px-3 sm:px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="bg-[#ff4500] text-white text-sm px-3 py-1 rounded-full font-medium">SNEAKYGUY</span>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">With us, you just need</span>
                </div>
              </div>
              
              <div className="relative mt-8">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-gray-700">Create a project and add keywords</p>
                    <p className="text-sm text-gray-600 mt-1">AI suggests relevant keywords for your product</p>
                  </div>
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-green-200">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">Total:</span>
                    <span className="text-green-600 font-medium">2 minutes one time</span>
                    <span className="text-gray-500">→</span>
                    <span className="text-gray-700">per project</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/0 to-gray-50 rounded-3xl" />
          <div className="relative rounded-3xl overflow-hidden border border-gray-200/60 shadow-2xl">
            {/* Results Message - Moved outside the aspect ratio container */}
            <div className="relative z-10 bg-white pt-8 px-4">
              <div className="text-center">
                <span className="inline-flex items-center gap-2 text-xl sm:text-2xl font-medium text-gray-900">
                  <MessageSquare className="w-6 h-6 text-[#FFFFFF]" />
                  80% of SneakyGuy's AI crafted responses received <span className="bg-[#ff4500] px-2 py-1 rounded-md text-white font-semibold">positive replies</span> from OPs
                </span>
              </div>
            </div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
          Early Adopter Benefits
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#ff4500]/10 hover:border-[#ff4500]/20 transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#fff3f0] to-white mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff4500]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Priority Feature Requests</h3>
            <p className="text-sm sm:text-base text-gray-600">Your feature requests get top priority in our development roadmap. Help shape the future of SNEAKYGUY.</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#ff4500]/10 hover:border-[#ff4500]/20 transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#fff3f0] to-white mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff4500]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Direct Access to Founders</h3>
            <p className="text-sm sm:text-base text-gray-600">Get direct access to our team. Your feedback is invaluable in making SNEAKYGUY better for everyone.</p>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-8 sm:py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            Ready to Automate Your Reddit Lead Generation?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto px-4">
            Join the early access program and start saving 30-60 hours monthly on your lead generation efforts.
          </p>
          <Button
            onClick={() => router.push('/login')}
            className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold w-full sm:w-auto"
          >
            Find Leads
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Get started with SneakyGuy today and transform your Reddit lead generation
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional Plan</h3>
                  <p className="text-gray-600 mb-4">Everything you need for effective Reddit lead generation</p>
                  
                  <div className="flex items-baseline mb-1">
                    <span className="text-gray-500 text-lg line-through">$120/month</span>
                    <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded text-sm font-medium">
                      Save 67%
                    </span>
                  </div>
                  
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">$39</span>
                    <span className="ml-2 text-gray-700">one-time payment</span>
                  </div>
                  
                  <div className="mt-6">
                    <Button
                      onClick={() => router.push('/login')}
                      className="w-full bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-6 py-3 font-medium"
                    >
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg w-full md:w-auto">
                  <h4 className="font-medium text-gray-900 mb-4">What's included:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#ff4500]" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">300 Replies/month</span>
                        <p className="text-sm text-gray-600">AI-generated responses to Reddit posts</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#ff4500]" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Unlimited Business-specific Keywords</span>
                        <p className="text-sm text-gray-600">Track mentions of your business-specific keywords</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#ff4500]" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">15 Relevant Subreddits relevant to your business</span>
                        <p className="text-sm text-gray-600">Monitor the most valuable communities</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#ff4500]" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Unlimited Reply Generation</span>
                        <p className="text-sm text-gray-600">Customize replies with more context and tone</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-[#ff4500]" />
                <span>7-day money-back guarantee if no leads are found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quirky Free Access Message */}
      <div className="mt-12 bg-[#fff3f0] rounded-2xl p-8 max-w-2xl mx-auto">
        <FreeAccessMessage />
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Image
                  src="/logo.png"
                  alt="SneakyGuy Logo"
                  width={40}
                  height={40}
                  className="mr-2"
                />
                <span className="font-bold text-xl text-gray-900">Sneakyguy</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Enterprise-grade Reddit lead generation for businesses. Automate your Reddit presence and never miss a potential lead again.
              </p>
              <div className="flex space-x-4">
                <a href="https://x.com/snow_stark17" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#ff4500]">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/in/sneakyguyai/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#ff4500]">
                  <Linkedin className="h-5 w-5" />
                </a>
                
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#how-it-works" className="text-gray-600 hover:text-[#ff4500]">How It Works</a>
                </li>
                <li>
                  <a href="#features" className="text-gray-600 hover:text-[#ff4500]">Features</a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-600 hover:text-[#ff4500]">Pricing</a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-[#ff4500]">About Me</Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-[#ff4500]">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-[#ff4500]">Terms of Service</Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} SneakyGuy. All rights reserved.
              </p>
              <div className="mt-4 md:mt-0">
                <a 
                  href="https://x.com/snow_stark17" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-500 hover:text-[#ff4500] text-sm font-medium"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
