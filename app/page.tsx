'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Brain, MessageSquare, Users, Star, Shield, Check, Twitter, Linkedin } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import Image from 'next/image';
import { FreeAccessMessage } from './components/FreeAccessMessage';
import Link from 'next/link';
import { useRef, useState } from 'react';
import confetti from 'canvas-confetti'; // You may need to install this package
import SocialProof from '@/components/SocialProof';
import { ROICalculator } from '@/components/ROICalculator';
import { PricingTable } from '@/components/PricingTable';
import { usePathname } from 'next/navigation';
import FloatingSubreddits from '@/components/FloatingSubreddits';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const ctaRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (user && pathname === '/') {
      router.push('/projects');
    }
  }, [user, router, pathname]);

  // Mouse tracking for floating subreddits
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    
    // Smart redirect based on user status
    if (user) {
      router.push('/upgrade'); // Logged in users go to upgrade page
    } else {
      router.push('/login'); // Non-logged in users go to login
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Floating Subreddits Animation */}
      <FloatingSubreddits mousePosition={mousePosition} count={40} />
      
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-20">
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
            
            <nav className="hidden md:flex space-x-10">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Pricing
              </a>
            </nav>
            
            <Button
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
              onClick={() => user ? router.push('/upgrade') : router.push('/login')}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>


      {/* Hero Section - Clean & Professional */}
      <div className="relative bg-white overflow-hidden min-h-[95vh] flex items-center">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0">
          {/* Minimal geometric pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <svg width="100%" height="100%" className="absolute">
              <defs>
                <pattern id="subtle-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#000" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#subtle-grid)" />
            </svg>
          </div>
          {/* Single subtle accent */}
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gray-100/30 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-20">
          <div className="text-center">
            {/* Social Proof Badge - PREMIUM */}
            <div className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold bg-white text-slate-700 mb-10 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-3 animate-pulse"></div>
              <Users className="h-5 w-5 mr-2 text-orange-600" />
              <span className="text-slate-700">Trusted by 50+ founders & marketing teams</span>
              <div className="ml-2 px-2 py-1 bg-orange-500 text-white text-xs rounded-full font-black">LIVE</div>
            </div>
            
            {/* Main Headline - Professional & Readable */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              <span className="text-orange-600">Find Reddit leads</span><br />
              while you sleep.
            </h1>
            
            {/* Subtitle - Clear & Compelling */}
            <p className="text-lg sm:text-xl md:text-2xl text-slate-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              Monitor 15+ subreddits, get AI-generated responses, and never miss a mention.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full text-gray-700 font-medium text-base shadow-sm border border-orange-200 mb-12">
              <span className="mr-2">💰</span>
              Starting at just $9/month — less than your daily coffee
              <span className="ml-2">☕</span>
            </div>
            
            {/* CTA Button */}
            <div className="flex justify-center mb-16">
              <Button
                ref={ctaRef}
                className="group relative bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={handleGetStarted}
              >
                <div className="flex items-center">
                  <span className="mr-2 text-lg"></span>
                  Start Finding Leads Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Button>
            </div>

            {/* Demo Video */}
            <div className="relative mx-auto max-w-4xl">
              <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-white border border-gray-200/50 p-2">
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                  <iframe 
                    src="https://www.loom.com/embed/01050bb0c0584256be51ddd489787480?sid=e4f38ddc-3d39-4627-8a78-b44f940d2b83" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px', border: 'none' }}
                    allowFullScreen
                    title="Sneakyguy Demo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">How SneakyGuy Works</h2>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left font-heading">Set Up Your Keywords</h3>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left font-heading">AI Identifies Opportunities</h3>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center lg:text-left font-heading">Generate & Post Responses</h3>
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
              onClick={() => user ? router.push('/upgrade') : router.push('/login')}
              className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-8 py-3 text-lg font-medium"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <SocialProof />

      {/* Features Section - Professional */}
      <div id="features" className="py-24 bg-white relative overflow-hidden">
        {/* Clean background with subtle accent */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block px-6 py-3 bg-orange-600 rounded-full text-white font-semibold text-sm mb-6 shadow-sm">
              ⚡ POWERFUL FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              See the <span className="text-orange-600">Magic</span> in Action
            </h2>
            <p className="text-lg sm:text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
              Watch SneakyGuy transform Reddit into your personal lead generation powerhouse
            </p>
          </div>

          <div className="space-y-20">
            {/* Feature 1: Simple Setup - Project Creation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                  Get Started in Under 30 Seconds
                </h3>
                <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                  Just enter your project name and a simple description. Our AI does the heavy lifting - 
                  automatically generating relevant keywords and suggesting the perfect subreddits for your business.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500 transition-all duration-200">
                    <div className="bg-emerald-500 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-800 font-semibold">✨ 2-field setup: Name + Description</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 transition-all duration-200">
                    <div className="bg-blue-500 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-800 font-semibold">🤖 AI generates keywords automatically</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500 transition-all duration-200">
                    <div className="bg-purple-500 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-800 font-semibold">🎯 Curated subreddit recommendations</span>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-2xl shadow-2xl border border-orange-200 overflow-hidden transform hover:scale-105 transition-transform duration-300">
                  <Image 
                    src="/create-project-screenshot.png" 
                    alt="Simple project creation - just name and description needed"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Feature 2: AI-Generated Keywords & Subreddits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-2xl shadow-xl border border-blue-200 overflow-hidden">
                  <Image 
                    src="/keywords-subreddits-screenshot.png" 
                    alt="AI-generated keywords and subreddit suggestions"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                  AI Generates Perfect Keywords & Subreddits
                </h3>
                <p className="text-lg text-slate-700 mb-6 leading-relaxed">
                  Watch our AI analyze your business description and instantly generate 15+ relevant keywords 
                  and 12+ targeted subreddits. No manual research needed - just review and confirm.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">15+ AI-generated keywords</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">12+ targeted subreddits</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">One-click regeneration</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Lead Feed Dashboard */}
            <div className="group grid grid-cols-1 lg:grid-cols-2 gap-12 items-center hover:scale-[1.02] transition-all duration-500">
              <div className="order-2 lg:order-1 space-y-6">
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors duration-300">
                  🎯 Discover High-Quality Leads Instantly
                </h3>
                <p className="text-xl font-medium text-slate-700 mb-8 leading-relaxed">
                  Your dashboard shows real Reddit mentions with smart relevance scoring (35-65/100). 
                  Each lead includes context, intent analysis, and one-click AI reply generation.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Smart relevance scoring (35-65/100)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Intent classification (solution_seeking)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">One-click "AI Reply" button</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Export to CSV for outreach</span>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                  <Image 
                    src="/lead-dashboard-screenshot.png" 
                    alt="Lead dashboard showing Reddit mentions with relevance scores and AI reply buttons"
                    width={600}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Response Example */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 font-heading mb-4">Real AI-Generated Response</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              See how our AI generates authentic, helpful responses that naturally introduce your solution and drive real business value.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="relative">
                <Image
                  src="/reddit-example.png"
                  alt="Real AI-generated Reddit response example"
                  width={1200}
                  height={600}
                  className="w-full"
                  priority
                />
                
                {/* Success indicators */}
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                  ✨ AI Generated
                </div>
                <div className="absolute bottom-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium">
                  🎯 Authentic & Helpful
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Calculator */}
      <ROICalculator />


      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">Why SneakyGuy?</h2>
            <p className="text-lg text-gray-600">Everything you need to turn Reddit into your best lead source.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-heading">AI-Powered Replies</h3>
              <p className="text-gray-600">Get smart, context-aware replies generated for every lead opportunity. Review and edit before posting.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-heading">Smart Keyword & Subreddit Suggestions</h3>
              <p className="text-gray-600">We suggest the best keywords and subreddits for your business, so you never miss a relevant conversation.</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 text-center">
              <Shield className="mx-auto h-10 w-10 text-[#ff4500] mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-heading">Build Your Brand Presence</h3>
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
          <div className="absolute inset-0 bg-white rounded-3xl border border-gray-100" />
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
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 border border-orange-200 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff4500]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Priority Feature Requests</h3>
            <p className="text-sm sm:text-base text-gray-600">Your feature requests get top priority in our development roadmap. Help shape the future of SNEAKYGUY.</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#ff4500]/10 hover:border-[#ff4500]/20 transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 border border-orange-200 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#ff4500]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Direct Access to Founders</h3>
            <p className="text-sm sm:text-base text-gray-600">Get direct access to our team. Your feedback is invaluable in making SNEAKYGUY better for everyone.</p>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-8 sm:py-12 md:py-20 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            Ready to Automate Your Reddit Lead Generation?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto px-4">
            Join the early access program and start saving 30-60 hours monthly on your lead generation efforts.
          </p>
          <Button
            onClick={() => user ? router.push('/upgrade') : router.push('/login')}
            className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold w-full sm:w-auto"
          >
            Find Leads
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingTable 
            onPlanSelect={() => {
              // Smart redirect based on user status
              if (user) {
                // If user is logged in, go to upgrade page with plan selection
                router.push('/upgrade');
              } else {
                // If not logged in, go to login first
                router.push('/login');
              }
            }}
          />
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
