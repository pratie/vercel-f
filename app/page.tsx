'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, Brain, MessageSquare, Users, Star, Shield, Check, Twitter, Linkedin } from 'lucide-react';
import { IconBrandReddit } from '@tabler/icons-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect } from 'react';
import Image from 'next/image';
import { FreeAccessMessage as IndieHackerMessage } from './components/FreeAccessMessage';
import Link from 'next/link';
import { useRef, useState } from 'react';
import confetti from 'canvas-confetti'; // You may need to install this package
import SocialProof from '@/components/SocialProof';
import { PricingTable } from '@/components/PricingTable';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { FAQ } from './components/FAQ';

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

    // Smart redirect based on user status
    if (user) {
      router.push('/upgrade'); // Logged in users go to upgrade page
    } else {
      router.push('/login'); // Non-logged in users go to login
    }
  };

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
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
              <span className="font-bold text-xl text-gray-900">SneakyGuy</span>
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


      {/* Hero Section - Modern & Impactful */}
      <div className="relative overflow-hidden min-h-[95vh] flex items-center">
        {/* Dynamic mesh gradient background */}
        <div className="absolute inset-0 bg-white">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF6F20]/5 blur-[120px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-gradient-to-tr from-orange-50/50 via-white to-purple-50/50 blur-[80px] rounded-full"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-20">
          <div className="text-center">
            {/* Main Headline - Bold & Clean */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-black mb-8 leading-[1.1] tracking-tight"
            >
              Your 24/7{' '}
              <span className="inline-flex items-center gap-2">
                <IconBrandReddit className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-[#FF4500]" />
                Reddit
              </span>
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-[#FF6F20] px-4">Lead Machine.</span>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 bg-[#FF6F20]/10 -skew-y-2 rounded-xl border-l-4 border-[#FF6F20]/20"
                ></motion.span>
              </span>
            </motion.h1>

            {/* Subtitle - Simple & Clear */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-xl sm:text-2xl text-gray-600 mb-16 max-w-4xl mx-auto leading-relaxed font-normal"
            >
              Never miss a relevant Reddit mention again. Track keywords, and generate quality leads with AI powered relevancy scoring and response generation.
            </motion.p>

            {/* CTA Button - Clean Orange */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
              className="flex justify-center mb-6"
            >
              <Button
                ref={ctaRef}
                className="bg-[#FF6F20] hover:bg-[#FF6F20]/90 text-white px-10 py-6 rounded-xl text-lg font-semibold shadow-[0_20px_50px_rgba(255,111,32,0.2)] hover:shadow-[0_20px_50px_rgba(255,111,32,0.4)] transition-all duration-300 flex items-center gap-2 hover:-translate-y-1"
                onClick={handleGetStarted}
              >
                Get Leads Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Social Proof Below CTA */}
            <div className="flex justify-center mb-20">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-3 rounded-full shadow-lg">
                <Users className="h-5 w-5 text-[#FFD700]" />
                <span className="text-white font-semibold text-sm">Trusted by <span className="text-[#FFD700]">60+</span> founders & solopreneurs</span>
              </div>
            </div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
              className="relative mx-auto max-w-5xl mt-12"
            >
              <div className="relative rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.1)] overflow-hidden bg-white border border-gray-200/50 p-1.5 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Image
                  src="/new Dashboard with analytics.png"
                  alt="SneakyGuy Advanced Analytics Dashboard"
                  width={1200}
                  height={675}
                  className="w-full h-auto rounded-xl transition-transform duration-700 group-hover:scale-[1.01]"
                  priority
                />

                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl animate-bounce hidden sm:block">
                  NEW: Advanced Insights ✨
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      {/* AI Fact Sources Section */}
      <section className="py-24 bg-gray-50/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block px-4 py-1.5 bg-[#FF6F20]/10 border border-[#FF6F20]/20 rounded-full text-[#FF6F20] font-bold text-xs mb-6 shadow-sm tracking-widest uppercase">
                📊 Market Intelligence
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                Why Reddit? It's where <span className="text-[#FF6F20]">AI</span> gets its facts.
              </h2>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed font-normal">
                According to recent Semrush analysis, <b>Reddit is the #1 source</b> where AI bots get their facts and citations.
                <br /><br />
                By monitoring Reddit with SneakyGuy, you're not just finding leads—you're being present where the world's knowledge is being built.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold mb-1">High Intent Data</p>
                    <p className="text-slate-600 text-sm">Reddit users provide the most authentic and verified information on the web.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#FF6F20]/10 border border-[#FF6F20]/20 flex items-center justify-center mt-1 flex-shrink-0">
                    <Check className="h-3.5 w-3.5 text-[#FF6F20]" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold mb-1">First-Mover Advantage</p>
                    <p className="text-slate-600 text-sm">Be the first to respond when prospects ask the questions that AI uses for its answers.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative max-w-sm lg:max-w-md mx-auto"
            >
              {/* Decorative elements behind the image */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/20 to-purple-400/20 blur-[80px] rounded-full scale-110"></div>

              <div className="relative bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Image
                  src="/ai-fact-sources.jpeg"
                  alt="Where AI gets its facts: Reddit at 40.11%"
                  width={600}
                  height={900}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-[1.02]"
                  priority
                />
              </div>

              {/* Stats Badge */}
              <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white p-3 rounded-lg shadow-xl border border-gray-800 hidden sm:block">
                <div className="text-xl font-bold text-[#FF6F20] mb-0.5">40.11%</div>
                <div className="text-[8px] font-medium text-gray-400 uppercase tracking-widest">Reddit Dominance</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">How SneakyGuy Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform automates the entire Reddit lead generation process in three simple steps
            </p>
          </div>

          <div className="relative">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 group"
              >
                <div className="bg-[#fff3f0] rounded-full w-12 h-12 flex items-center justify-center mb-6 mx-auto lg:mx-0 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-[#FF6F20] font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center lg:text-left font-heading">Set Up Your Keywords</h3>
                <p className="text-gray-600 mb-6 text-center lg:text-left leading-relaxed">
                  Enter your business keywords and select relevant subreddits. SneakyGuy will monitor these 24/7 for potential leads.
                </p>
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200/50 p-3 text-sm font-mono shadow-sm">
                    <span className="text-purple-600 font-semibold">keywords</span>: [<span className="text-green-600">"saas tool"</span>, <span className="text-green-600">"lead generation"</span>]
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 group"
              >
                <div className="bg-[#fff3f0] rounded-full w-12 h-12 flex items-center justify-center mb-6 mx-auto lg:mx-0 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-[#FF6F20] font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center lg:text-left font-heading">AI Identifies Opportunities</h3>
                <p className="text-gray-600 mb-6 text-center lg:text-left leading-relaxed">
                  Our AI analyzes Reddit posts and comments to find discussions where your product could be a solution.
                </p>
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200/50 p-3 text-sm shadow-sm">
                    <div className="flex items-start gap-2">
                      <Brain className="h-4 w-4 text-[#FF6F20] mt-0.5" />
                      <span className="text-gray-700">Analyzing post: "Looking for a tool to find leads on social media..."</span>
                    </div>
                    <div className="mt-2 ml-6 text-green-600 font-semibold">Match found! (92% relevance)</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 group"
              >
                <div className="bg-[#fff3f0] rounded-full w-12 h-12 flex items-center justify-center mb-6 mx-auto lg:mx-0 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-[#FF6F20] font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center lg:text-left font-heading">Generate & Post Responses</h3>
                <p className="text-gray-600 mb-6 text-center lg:text-left leading-relaxed">
                  SneakyGuy creates personalized responses that subtly promote your product while providing genuine value.
                </p>
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200/50 p-3 text-sm shadow-sm">
                    <div className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0 mr-2 border border-gray-300/50"></div>
                      <div className="text-gray-700 italic">
                        "I've been using SneakyGuy for this purpose and it's been a game-changer..."
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button
              onClick={() => user ? router.push('/upgrade') : router.push('/login')}
              className="button-primary px-8 py-3 text-lg font-medium"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <SocialProof />

      {/* Demo Video Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 font-heading">See SneakyGuy In Action</h2>
            <p className="mt-4 text-lg text-gray-600">Watch how easy it is to set up and start generating leads.</p>
          </div>
          <div className="relative mx-auto max-w-4xl">
            <div className="relative rounded-2xl shadow-xl overflow-hidden bg-white border border-gray-100 p-2">
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src="https://www.loom.com/embed/01050bb0c0584256be51ddd489787480?sid=e4f38ddc-3d39-4627-8a78-b44f940d2b83"
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px', border: 'none' }}
                  allowFullScreen
                  title="SneakyGuy Demo"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Professional */}
      <div id="features" className="py-24 relative overflow-hidden">
        {/* Clean background with subtle accent */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <div className="inline-block px-6 py-2 bg-[#FF6F20]/10 border border-[#FF6F20]/20 rounded-full text-[#FF6F20] font-bold text-xs mb-6 shadow-sm tracking-widest uppercase">
              ⚡ Powerful Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              See the <span className="text-[#FF6F20]">Magic</span> in Action
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Watch SneakyGuy transform Reddit into your personal lead generation powerhouse
            </p>
          </motion.div>

          <div className="space-y-20">
            {/* Feature 1: Simple Setup - Project Creation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-2 lg:order-1"
              >
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                  Get Started in Under 30 Seconds
                </h3>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Just enter your project name and a simple description. Our AI does the heavy lifting -
                  automatically generating relevant keywords and suggesting the perfect subreddits for your business.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-500/20">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-800 font-semibold">✨ 2-field setup: Name + Description</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-blue-500 rounded-full p-1.5 shadow-lg shadow-blue-500/20">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-800 font-semibold">🤖 AI generates keywords automatically</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-purple-500 rounded-full p-1.5 shadow-lg shadow-purple-500/20">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-800 font-semibold">🎯 Curated subreddit recommendations</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="order-1 lg:order-2"
              >
                <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                  <Image
                    src="/create-project-screenshot.png"
                    alt="Simple project creation - just name and description needed"
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            >
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-blue-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
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
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 font-heading">
                  AI Generates Perfect Keywords & Subreddits
                </h3>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Watch our AI analyze your business description and instantly generate 15+ relevant keywords
                  and 12+ targeted subreddits. No manual research needed - just review and confirm.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-800 font-semibold">15+ AI-generated keywords</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-800 font-semibold">12+ targeted subreddits</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 3: Lead Feed Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 lg:order-1 space-y-6">
              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6 leading-tight font-heading">
                🎯 Discover High-Quality Leads Instantly
              </h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Your dashboard shows real Reddit mentions with smart relevance scoring.
                Each lead includes context, intent analysis, and one-click AI reply generation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="bg-emerald-100 rounded-full p-1">
                    <Check className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span className="text-slate-800 text-sm font-semibold">Smart scoring</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="bg-blue-100 rounded-full p-1">
                    <Check className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-slate-800 text-sm font-semibold">Intent analysis</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="bg-orange-100 rounded-full p-1">
                    <Check className="h-3 w-3 text-orange-600" />
                  </div>
                  <span className="text-slate-800 text-sm font-semibold">One-click AI Reply</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-md border border-white/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="bg-purple-100 rounded-full p-1">
                    <Check className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="text-slate-800 text-sm font-semibold">CSV Export</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="/lead-dashboard-screenshot.png"
                  alt="Lead dashboard showing Reddit mentions with relevance scores and AI reply buttons"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>
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

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/20 overflow-hidden group">
              <div className="relative">
                <Image
                  src="/reddit-example.png"
                  alt="Real AI-generated Reddit response example"
                  width={1200}
                  height={600}
                  className="w-full transition-transform duration-700 group-hover:scale-[1.01]"
                  priority
                />

              </div>
            </div>
          </motion.div>
        </div>
      </div>

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
              <Shield className="mx-auto h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2 font-heading">Build Your Brand Presence</h3>
              <p className="text-gray-600">Connect your Reddit account and manage your brand’s presence on Reddit from one place.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Time Savings Message */}
      <div className="text-center mt-12 mb-20">
        <div className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-full text-lg shadow-xl shadow-gray-200">
          <span className="font-bold text-[#FF6F20]">You save 30-60 hours monthly</span>
          <span className="text-gray-300">for each project!</span>
        </div>
      </div>

      {/* Value Proposition Section - Interactive Comparison */}
      <div className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-heading">
              Stop Wasting <span className="text-red-500">Hours</span> on Manual Outreach
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              SneakyGuy automates the boring stuff so you can focus on building your product.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* The Old Way */}
            <div className="lg:col-span-12 overflow-hidden bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Manual Search</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Scouring subreddits every hour, refreshing pages, and keeping Google Sheets updated.
                  </p>
                  <div className="text-red-500 font-bold text-lg">2-3 Hours Daily</div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Filtering Noise</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Clicking on 100+ posts to find the 5 that actually matter. Ignoring spam manually.
                  </p>
                  <div className="text-red-500 font-bold text-lg">Mental Burnout</div>
                </div>

                <div className="p-8 bg-red-50/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Response Crafting</h3>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Struggling to write authentic, non-salesy comments for every single post you find.
                  </p>
                  <div className="text-red-500 font-bold text-lg">Inconsistent Results</div>
                </div>
              </div>
            </div>

            {/* The SneakyGuy Way - Featured Ribbon */}
            <div className="lg:col-span-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary))] to-orange-400 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
              <div className="relative bg-gray-900 rounded-3xl p-8 md:p-12 border border-blue-500/30 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-4">
                  <div className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    Best Solution
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-6">
                      The <span className="text-[#FF6F20]">SneakyGuy</span> Advantage
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">24/7 Autopilot Monitoring</p>
                          <p className="text-gray-400 text-sm">We scrawl Reddit while you sleep. Mentions appear in real-time.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">AI Intent Detection</p>
                          <p className="text-gray-400 text-sm">Our AI filters out the fluff and only shows you people ready to buy.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center mt-1 flex-shrink-0">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">Instant AI Drafts</p>
                          <p className="text-gray-400 text-sm">One click generates a high-quality, relevant reply for you.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center">
                    <div className="text-5xl font-black text-[#FF6F20] mb-2 tracking-tighter">98%</div>
                    <p className="text-gray-300 text-lg mb-8 uppercase tracking-widest font-bold">Time Saved</p>
                    <div className="h-2 bg-gray-800 rounded-full mb-8">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '98%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#FF6F20] to-orange-400 rounded-full"
                      ></motion.div>
                    </div>
                    <Button
                      onClick={handleGetStarted}
                      className="w-full bg-white text-gray-900 hover:bg-gray-100 py-6 rounded-xl font-bold text-lg"
                    >
                      Stop the Manual Scrawl
                    </Button>
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
                  80% of SneakyGuy's AI crafted responses received <span className="bg-[hsl(var(--primary))] px-2 py-1 rounded-md text-white font-semibold">positive replies</span> from OPs
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
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[hsl(var(--primary))]/10 hover:border-[hsl(var(--primary))]/20 transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[hsl(var(--accent))]/15 border border-[hsl(var(--accent))]/30 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Priority Feature Requests</h3>
            <p className="text-sm sm:text-base text-gray-600">Your feature requests get top priority in our development roadmap. Help shape the future of SneakyGuy.</p>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-[hsl(var(--primary))]/10 hover:border-[hsl(var(--primary))]/20 transition-all duration-200">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[hsl(var(--accent))]/15 border border-[hsl(var(--accent))]/30 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[hsl(var(--primary))]" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Direct Access to Founders</h3>
            <p className="text-sm sm:text-base text-gray-600">Get direct access to our team. Your feedback is invaluable in making SneakyGuy better for everyone.</p>
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
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold w-full sm:w-auto"
          >
            Get Leads
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </div>

      {/* Value Justification Section - Why $19 is Worth It */}
      <div className="py-24 bg-gradient-to-br from-orange-50 via-white to-purple-50 overflow-hidden relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-orange-500/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight font-heading">
              The <span className="text-[#FF6F20]">$19</span> Value Proposition
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              One single Reddit lead can pay for this tool 100x over.
              Stop guessing and start getting results.
            </p>
          </div>

          {/* Value Breakdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/20 p-8 sm:p-12 mb-12"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10 text-center font-heading">
              The math checks out.
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg mb-1">Save 60+ hours/month</div>
                  <div className="text-gray-600 leading-relaxed">At $50/hour = <span className="font-bold text-[#FF6F20]">$3,000 value</span> monthly.</div>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg mb-1">24/7 Lead Monitoring</div>
                  <div className="text-gray-600 leading-relaxed">Never sleep, never miss opportunities. We track leads <span className="font-bold text-[#FF6F20]">while you dream</span>.</div>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg mb-1">AI-Powered Responses</div>
                  <div className="text-gray-600 leading-relaxed">Engage authentically with AI-crafted drafts. Better than a dedicated social manager.</div>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Check className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg mb-1">ROI with 1 Customer</div>
                  <div className="text-gray-600 leading-relaxed">Just one converted Reddit lead pays for <span className="font-bold text-[#FF6F20]">your entire month</span>.</div>
                </div>
              </div>
            </div>

            {/* ROI Highlight */}
            <div className="bg-gradient-to-r from-[#FF6F20]/5 via-white to-purple-500/5 rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
              <div className="text-xl font-bold text-gray-900 mb-2">
                🚀 15,789% Potential ROI
              </div>
              <div className="text-gray-600 font-medium">
                Join founders generating <span className="text-[#FF6F20] font-bold">5-10 new qualified leads</span> every month.
              </div>
            </div>
          </motion.div>

          {/* Social Proof */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-50 px-6 py-3 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900 font-medium">Trusted by 60+ founders & solopreneurs generating Reddit leads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Risk-Free Notice */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 backdrop-blur-md border border-gray-100 rounded-full shadow-sm">
              <div className="bg-emerald-500 rounded-full p-1">
                <Check className="h-3 w-3 text-white" />
              </div>
              <span className="text-gray-800 font-bold">7-Day Money-Back Guarantee. Risk Free.</span>
            </div>
          </div>

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

      <FAQ />

      {/* Indie Hacker Message */}
      <div className="mt-12 mb-20">
        <IndieHackerMessage />
      </div>

      {/* Footer */}
      <footer className="relative bg-gray-50/50 border-t border-gray-200 pt-24 pb-12 overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 z-10">
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
                <span className="font-bold text-xl text-gray-900">SneakyGuy</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Enterprise-grade Reddit lead generation for businesses. Automate your Reddit presence and never miss a potential lead again.
              </p>
              <div className="flex space-x-4">
                <a href="https://x.com/snow_stark17" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[hsl(var(--primary))]">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://www.linkedin.com/in/sneakyguyai/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[hsl(var(--primary))]">
                  <Linkedin className="h-5 w-5" />
                </a>

              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#how-it-works" className="text-gray-600 hover:text-[hsl(var(--primary))]">How It Works</a>
                </li>
                <li>
                  <a href="#features" className="text-gray-600 hover:text-[hsl(var(--primary))]">Features</a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-600 hover:text-[hsl(var(--primary))]">Pricing</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-600 hover:text-[hsl(var(--primary))]">About Me</Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-600 hover:text-[hsl(var(--primary))]">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-[hsl(var(--primary))]">Terms of Service</Link>
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
                  className="text-gray-500 hover:text-[hsl(var(--primary))] text-sm font-medium"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <StickyCTA />
    </main>
  );
}

// Sticky CTA for Mobile
function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 800px
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-0 left-0 right-0 p-4 z-50 md:hidden"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Start Today</div>
              <div className="font-bold text-gray-900">$19 <span className="text-gray-400 font-normal">/ month</span></div>
            </div>
            <Link
              href="/signup"
              className="bg-[#FF6F20] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-transform"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
