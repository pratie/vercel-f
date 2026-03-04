'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, MessageSquare, Users, Check, Twitter, Linkedin, Search, Zap, BarChart } from 'lucide-react';
import { IconBrandReddit } from '@tabler/icons-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import SocialProof from '@/components/SocialProof';
import { PricingTable } from '@/components/PricingTable';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

import { FAQ } from './components/FAQ';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const ctaRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  useEffect(() => {
    if (user && pathname === '/') {
      router.push('/projects');
    }
  }, [user, router, pathname]);

  const handleGetStarted = () => {
    if (ctaRef.current) {
      const rect = ctaRef.current.getBoundingClientRect();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight },
        colors: ['#FF6F20', '#FFA07A', '#FF4500']
      });
    }

    if (user) {
      router.push('/upgrade');
    } else {
      router.push('/login');
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeUpBlock = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-[#FF6F20]/20 relative overflow-hidden">

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.5 }}></div>

      {/* Glowing Orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-100/50 rounded-full blur-[120px] -z-10 mix-blend-multiply opacity-70 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-40 left-[-200px] w-[500px] h-[500px] bg-red-50/50 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-60"></div>

      {/* Navigation */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 transition-all duration-300"
        style={{ opacity: headerOpacity }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="SneakyGuy Logo"
                width={32}
                height={32}
                className="group-hover:scale-105 transition-transform mix-blend-multiply"
              />
              <span className="font-extrabold text-xl tracking-tight text-slate-900">SneakyGuy</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How it Works</a>
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Blog</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Sign In</Link>
              <Button
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                onClick={() => user ? router.push('/projects') : router.push('/login')}
              >
                {user ? 'Dashboard' : 'Get Started'}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 sm:px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="show"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpBlock} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50/80 border border-orange-100 mb-8 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6F20] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6F20]"></span>
              </span>
              <span className="text-sm font-semibold text-orange-800 tracking-wide uppercase">AI-Powered Reddit Lead Generation</span>
            </motion.div>

            <motion.h1 variants={fadeUpBlock} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Turn Reddit discussions into <br className="hidden md:block" />
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-[#FF6F20]">warm leads</span>
                <span className="absolute bottom-2 left-0 w-full h-3 bg-orange-200/40 -z-10 rounded-sm"></span>
              </span> while you sleep.
            </motion.h1>

            <motion.p variants={fadeUpBlock} className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              SneakyGuy monitors Reddit 24/7 for high-intent conversations relevant to your product and auto-generates replies that convert.
            </motion.p>

            <motion.div variants={fadeUpBlock} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                ref={ctaRef}
                className="w-full sm:w-auto bg-[#FF6F20] hover:bg-[#FF6F20]/90 text-white px-8 py-6 rounded-2xl text-lg font-bold shadow-[0_8px_20px_rgba(255,111,32,0.25)] hover:shadow-[0_12px_25px_rgba(255,111,32,0.35)] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-1 group"
                onClick={handleGetStarted}
              >
                Start Finding Leads
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-white/80 backdrop-blur border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-6 rounded-2xl text-lg font-semibold shadow-sm transition-all duration-300"
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See how it works
              </Button>
            </motion.div>

            <motion.div variants={fadeUpBlock} className="mt-8 flex items-center justify-center gap-4 text-sm font-medium text-slate-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                    <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User avatar" width={32} height={32} />
                  </div>
                ))}
              </div>
              <div>Joined by <span className="text-slate-900 font-bold">100+</span> indie hackers & founders</div>
            </motion.div>
          </motion.div>

          {/* Hero Image/Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, type: 'spring', stiffness: 50 }}
            className="mt-20 relative lg:px-10"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAFAFA] via-transparent to-transparent z-10 h-full pointer-events-none"></div>

            <div className="relative rounded-[2rem] border border-slate-200/60 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.07)] overflow-hidden">
              {/* Browser Header */}
              <div className="bg-slate-50/80 backdrop-blur border-b border-slate-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto bg-white border border-slate-200 rounded-md px-3 py-1 flex items-center gap-2 text-xs text-slate-500 shadow-sm w-48 justify-center">
                  <Search className="w-3 h-3" /> app.sneakyguy.com
                </div>
              </div>
              <Image
                src="/new Dashboard with analytics.png"
                alt="SneakyGuy Dashboard preview showing high intent leads"
                width={1200}
                height={675}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Floating elements removed per user request */}
          </motion.div>
        </div>
      </section>

      {/* How it Works - Minimalist Steps */}
      <section id="how-it-works" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Autopilot in 3 simple steps</h2>
            <p className="text-lg text-slate-600">Set it up once, and let our AI tirelessly scan Reddit to bring the best prospects directly to your dashboard.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relativer">
            {/* Step 1 */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUpBlock}
              className="relative p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-[#FF6F20] font-black text-2xl">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Define Your SaaS</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Enter a brief description of what your SaaS does. Our AI automatically extracts the best keywords and finds relevant subreddits.</p>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm font-mono text-sm text-slate-500">
                <span className="text-purple-600">keywords:</span> ["lead generation", "saas tool"]
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUpBlock} transition={{ delay: 0.1 }}
              className="relative p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-[#FF6F20] font-black text-2xl">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Scans Reddit</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">SneakyGuy's engine analyzes thousands of new posts and comments, scoring them for intent to find perfect opportunities.</p>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-sm">
                <div className="flex items-center gap-2 text-slate-700 font-medium mb-1"><Search size={16} className="text-orange-500" /> Found post</div>
                <div className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block text-xs">92% Intent Match</div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={fadeUpBlock} transition={{ delay: 0.2 }}
              className="relative p-8 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-[#FF6F20] font-black text-2xl">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Reply & Convert</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">Review the AI-generated context-aware replies. With one click, post an authentic response that casually drops your SaaS.</p>
              <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="text-xs text-slate-600 italic">"I built a tool exactly for this workflow..."</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Deep Dive Features */}
      <section id="features" className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">

          {/* Feature 1 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUpBlock} className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold mb-6">
                <Zap size={16} className="text-yellow-500" /> Fast Setup
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Setup in literally seconds.</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Don't waste time figuring out Reddit search syntax or manually hunting subreddits. Drop your startup's pitch, and we automatically extract targeted keywords and discover the most lucrative communities for you.
              </p>

              <ul className="space-y-4">
                {["No complex boolean operators needed", "AI discovers niche subreddits", "Continuous self-optimizing keyword tuning"].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-center gap-3 text-slate-700 font-medium"
                  >
                    <div className="bg-green-100 text-green-600 rounded-full p-1"><Check size={14} strokeWidth={3} /></div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-orange-50 rounded-[2.5rem] transform rotate-3 scale-105 -z-10"></div>
              <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
                <Image src="/create-project-screenshot.png" alt="Project creation" width={800} height={600} className="w-full h-auto" />
              </div>
            </motion.div>
          </div>

          {/* Feature 2 */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-100 to-purple-50 rounded-[2.5rem] transform -rotate-3 scale-105 -z-10"></div>
              <div className="bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-slate-100 overflow-hidden">
                <Image src="/lead-dashboard-screenshot.png" alt="Lead dashboard with relevance scores" width={800} height={600} className="w-full h-auto" />
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUpBlock}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold mb-6">
                <Brain size={16} className="text-purple-500" /> Smart Intent
              </div>
              <h3 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">Zero noise. Only intent.</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We don't just alert you on keyword mentions. Our intent engine reads the context of the conversation and grades the lead. You only see posts from users who are actively looking for a solution like yours.
              </p>

              <ul className="space-y-4">
                {["Relevance scoring (0-100%)", "Sentiment analysis included", "Context-aware AI reply generation", "One-click publishing to Reddit"].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 + 0.3 }}
                    className="flex items-center gap-3 text-slate-700 font-medium"
                  >
                    <div className="bg-green-100 text-green-600 rounded-full p-1"><Check size={14} strokeWidth={3} /></div>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Comparison Section (Old Way vs New Way) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FF6F20]/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px] translate-y-1/3 -translate-x-1/3"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Ditch the spreadsheets.</h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Stop wasting hours manually hunting for leads on Reddit.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* The Old Way */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-[2rem] p-8 md:p-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-300">The Old Way</h3>
              </div>

              <ul className="space-y-6">
                <li className="flex gap-4 opacity-70">
                  <div className="mt-1 flex-shrink-0 text-slate-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
                  <div>
                    <h4 className="font-semibold text-slate-200">Hours of manual searching</h4>
                    <p className="text-sm text-slate-400 mt-1">Endlessly scrolling through subreddits looking for a mention.</p>
                  </div>
                </li>
                <li className="flex gap-4 opacity-70">
                  <div className="mt-1 flex-shrink-0 text-slate-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div>
                  <div>
                    <h4 className="font-semibold text-slate-200">Struggling with replies</h4>
                    <p className="text-sm text-slate-400 mt-1">Trying not to sound like a bot and getting banned.</p>
                  </div>
                </li>
                <li className="flex gap-4 opacity-70">
                  <div className="mt-1 flex-shrink-0 text-slate-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20" /><path d="M12 2v20" /></svg></div>
                  <div>
                    <h4 className="font-semibold text-slate-200">Missing opportunities</h4>
                    <p className="text-sm text-slate-400 mt-1">Sleeping while your competitors snag the best leads.</p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* The SneakyGuy Way */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#FF6F20] to-orange-600 rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-orange-900/50"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>

              <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                  <Check strokeWidth={3} size={20} />
                </div>
                <h3 className="text-2xl font-bold text-white">With SneakyGuy</h3>
              </div>

              <ul className="space-y-6 relative z-10">
                <li className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 text-orange-200"><Check size={20} strokeWidth={3} /></div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">24/7 Autopilot</h4>
                    <p className="text-orange-100 mt-1">We monitor Reddit continuously while you focus on building.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 text-orange-200"><Check size={20} strokeWidth={3} /></div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">AI Intent Detection</h4>
                    <p className="text-orange-100 mt-1">Never read a useless thread again. Only see hot leads.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="mt-1 flex-shrink-0 text-orange-200"><Check size={20} strokeWidth={3} /></div>
                  <div>
                    <h4 className="font-semibold text-white text-lg">Instant Authentic Replies</h4>
                    <p className="text-orange-100 mt-1">Context-aware AI drafts perfect, non-spammy responses.</p>
                  </div>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">See it in action</h2>
            <p className="text-lg text-slate-600">Watch a 2-minute walkthrough of how SneakyGuy snags high quality leads.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-slate-100 bg-slate-50 p-2"
          >
            <div className="relative rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.loom.com/embed/01050bb0c0584256be51ddd489787480?sid=e4f38ddc-3d39-4627-8a78-b44f940d2b83"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                title="SneakyGuy Demo"
                className="rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProof />

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold mb-6 border border-green-100">
              <Check size={16} strokeWidth={3} /> 7-Day Risk-Free Guarantee
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Invest in a tool that pays for itself with just one converted lead.</p>
          </div>

          <PricingTable
            onPlanSelect={() => {
              if (user) router.push('/upgrade');
              else router.push('/login');
            }}
          />
        </div>
      </section>

      <div className="bg-[#FAFAFA] pb-24">
        <FAQ />
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <Image
                  src="/logo.png"
                  alt="SneakyGuy Logo"
                  width={32}
                  height={32}
                  className="mix-blend-multiply"
                />
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">SneakyGuy</span>
              </Link>
              <p className="text-slate-500 mb-6 max-w-sm leading-relaxed">
                The most advanced AI-powered Reddit lead generation platform. Find conversations that matter, automatically.
              </p>
              <div className="flex gap-4">
                <a href="https://x.com/snow_stark17" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#FF6F20] transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="https://www.linkedin.com/in/sneakyguyai/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-[#FF6F20] transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#how-it-works" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">How it works</a></li>
                <li><a href="#features" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Pricing</a></li>
                <li><Link href="/blog" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Terms of Service</Link></li>
                <li><a href="mailto:support@sneakyguy.com" className="text-slate-500 hover:text-slate-900 text-sm font-medium transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} SneakyGuy. All rights reserved.
            </p>
            <div className="text-slate-400 text-sm flex items-center gap-1">
              Made with <HeartIcon className="w-4 h-4 text-red-500 inline" /> for indie founders.
            </div>
          </div>
        </div>
      </footer>

      <StickyCTA user={user} router={router} />
    </main>
  );
}

// Simple Heart Icon component
function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

// Sticky CTA for Mobile
function StickyCTA({ user, router }: { user: any, router: any }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-orange-400 font-bold uppercase tracking-wider mb-0.5">Start Finding Leads</div>
              <div className="font-bold text-white text-sm">Grow your SaaS today</div>
            </div>
            <Button
              onClick={() => user ? router.push('/upgrade') : router.push('/login')}
              className="bg-[#FF6F20] hover:bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 whitespace-nowrap"
            >
              Get Started
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
