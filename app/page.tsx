'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Target, Brain, Filter, ChevronRight, MessageSquare, Rocket, Users, Star, Shield, Sparkles, Mail, Check, Twitter, Linkedin } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import Image from 'next/image';
import { FreeAccessMessage } from './components/FreeAccessMessage';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && window.location.pathname === '/') {
      router.push('/projects');
    }
  }, [user, router]);

  const handleGetStarted = () => {
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
      <div className="bg-[#ff4500] text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          <span className="font-semibold">New:</span> AI-powered response generation now available!
        </p>
      </div>

      {/* Hero Section - Redesigned for better readability */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 pt-8 sm:pt-12 lg:pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[#fff3f0] rounded-bl-[100px] opacity-80"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[#fff3f0] text-[#ff4500] mb-8">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>AI-Powered Lead Generation</span>
                </div>
                
                <h1 className="mb-6 text-gray-900">
                  Find Reddit Leads<br />
                  <span className="text-[#ff4500]">While You Sleep</span>
                </h1>
                
                <p className="mt-3 text-lg sm:text-xl text-gray-600 mb-8">
                  Sneakyguy helps B2B companies discover and convert qualified leads from Reddit discussions with AI-powered monitoring and response generation.
                </p>

                <div className="mt-8 sm:flex sm:justify-center lg:justify-start gap-4">
                  <Button
                    className="button-primary w-full sm:w-auto mb-4 sm:mb-0 text-lg py-6"
                    onClick={handleGetStarted}
                  >
                    Find Leads Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-8 flex items-center gap-4 text-sm text-gray-500 justify-center lg:justify-start">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-[#ff4500] mr-2" />
                    AI-powered lead generation
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-[#ff4500] mr-2" />
                    24/7 Reddit monitoring
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6 relative">
              <div className="relative mx-auto w-full rounded-lg shadow-lg overflow-hidden">
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
                  <span className="line-through opacity-75">$120/month</span>
                  <span className="font-bold text-2xl ml-2">$39</span>
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
                  <span>90 Replies/month</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>15 Business specific Keywords</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>10 AI relevant Subreddits</span>
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
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Enterprise-Grade Reddit Lead Generation</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help B2B companies find and convert qualified leads from Reddit
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-[#fff3f0] w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-[#ff4500]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Intelligent Lead Discovery</h3>
              <p className="text-gray-600 mb-4">
                Our AI identifies high-intent discussions where users are actively seeking solutions like yours.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Advanced relevancy scoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Real-time monitoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Custom keyword tracking</span>
                </li>
              </ul>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-[#fff3f0] w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-7 w-7 text-[#ff4500]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Response Generation</h3>
              <p className="text-gray-600 mb-4">
                Create personalized, natural-sounding responses that subtly promote your product while providing value.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Contextual understanding</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Multiple response variations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Brand voice customization</span>
                </li>
              </ul>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-[#fff3f0] w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Filter className="h-7 w-7 text-[#ff4500]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Subreddit Targeting</h3>
              <p className="text-gray-600 mb-4">
                Focus your lead generation efforts on the most relevant communities for your business.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Subreddit recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Engagement analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Competitor monitoring</span>
                </li>
              </ul>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-white rounded-xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-[#fff3f0] w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-7 w-7 text-[#ff4500]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">24/7 Automated Monitoring</h3>
              <p className="text-gray-600 mb-4">
                Never miss a potential lead with round-the-clock monitoring of Reddit discussions.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Instant notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Email alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Priority-based queuing</span>
                </li>
              </ul>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-white rounded-xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-[#fff3f0] w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <ChevronRight className="h-7 w-7 text-[#ff4500]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lead Conversion Tracking</h3>
              <p className="text-gray-600 mb-4">
                Track the performance of your Reddit lead generation efforts with detailed analytics.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Conversion attribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Performance dashboards</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">ROI calculation</span>
                </li>
              </ul>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-white rounded-xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-[#fff3f0] w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <MessageSquare className="h-7 w-7 text-[#ff4500]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Response Management</h3>
              <p className="text-gray-600 mb-4">
                Review, edit, and approve AI-generated responses before they're posted to Reddit.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Approval workflows</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Response templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-[#ff4500]" />
                  </div>
                  <span className="text-gray-700">Team collaboration</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Button
              onClick={() => router.push('/login')}
              className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-8 py-3 text-lg font-medium"
            >
              Explore All Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
                    <p className="text-sm text-gray-500 mt-1">AI suggests relevant keywords for your product</p>
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
                        <span className="font-medium text-gray-900">90 Replies/month</span>
                        <p className="text-sm text-gray-600">AI-generated responses to Reddit posts</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#ff4500]" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">15 Business Keywords</span>
                        <p className="text-sm text-gray-600">Track mentions of your product and industry</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#ff4500]" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">10 Relevant Subreddits</span>
                        <p className="text-sm text-gray-600">Monitor the most valuable communities</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#ff4500]" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Unlimited Reply Generation</span>
                        <p className="text-sm text-gray-600">Create as many response variations as needed</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#fff3f0] flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-[#ff4500]" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">All Future Updates</span>
                        <p className="text-sm text-gray-600">Access to new features as they're released</p>
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
                <a href="#" className="text-gray-500 hover:text-[#ff4500]">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-[#ff4500]">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-[#ff4500]">
                  <Mail className="h-5 w-5" />
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
                  <a href="#" className="text-gray-600 hover:text-[#ff4500]">About Us</a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#ff4500]">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-[#ff4500]">Terms of Service</a>
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
                <Button variant="ghost" className="text-gray-500 hover:text-[#ff4500] text-sm">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
