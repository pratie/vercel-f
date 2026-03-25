'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowRight, Brain, MessageSquare, Check, Twitter, Linkedin, Search, Zap, BarChart, Shield, Sparkles, Target, Bot, Clock, TrendingUp, Star, ChevronRight, Play, Globe } from 'lucide-react';
import { IconBrandReddit } from '@tabler/icons-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import SocialProof from '@/components/SocialProof';
import { HowItWorksAnimation } from '@/components/HowItWorksAnimation';
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
  const navBg = useTransform(scrollYProgress, [0, 0.02], [0, 1]);
  const [navOpacity, setNavOpacity] = useState(0);
  const [heroUrl, setHeroUrl] = useState('');

  useEffect(() => {
    const unsubscribe = navBg.on('change', (v) => setNavOpacity(v));
    return unsubscribe;
  }, [navBg]);

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
        colors: ['#f97316', '#fb923c', '#ea580c']
      });
    }
    if (user) {
      router.push('/upgrade');
    } else {
      router.push('/login');
    }
  };

  const handleHeroUrlSubmit = () => {
    if (!heroUrl.trim()) {
      handleGetStarted();
      return;
    }
    // Store the URL so projects page can pick it up
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pending_analyze_url', heroUrl.trim());
    }
    if (user) {
      router.push('/projects?analyze=true');
    } else {
      router.push('/login?redirect=/projects?analyze=true');
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <main className="min-h-screen bg-white text-gray-950 font-sans selection:bg-orange-500/10 relative">

      {/* ───── NAVIGATION ───── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300"
        style={{
          backgroundColor: `rgba(250,250,248,${navOpacity * 0.9})`,
          backdropFilter: navOpacity > 0 ? 'blur(20px) saturate(180%)' : 'none',
          borderBottom: navOpacity > 0.5 ? '1px solid rgba(0,0,0,0.04)' : '1px solid transparent',
        }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <Image src="/logo.png" alt="SneakyGuy" width={34} height={34} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold text-xl tracking-tight text-gray-900">SneakyGuy</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: 'How it Works', href: '#how-it-works' },
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Blog', href: '/blog' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:block text-[13px] font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
              >
                Sign in
              </Link>
              <Button
                className="bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-semibold px-4 h-9 rounded-lg shadow-sm transition-[background-color,box-shadow,scale] hover:shadow-md"
                onClick={() => user ? router.push('/projects') : router.push('/login')}
              >
                {user ? 'Dashboard' : 'Get Started'}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* ───── HERO ───── */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-6 overflow-hidden bg-[#FAFAF8]">
        {/* Subtle warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/40 via-[#FAFAF8] to-white -z-10" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-100/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-amber-50/30 rounded-full blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="show" variants={stagger}>

            {/* Activity Badge */}
            <motion.div variants={fadeUp} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] text-[13px] font-medium text-gray-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                12 founders joined this week!
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeUp} className="text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.25rem] font-extrabold tracking-[-0.035em] text-gray-950 mb-6 leading-[1.05]">
              Find{' '}
              <span className="inline-flex items-baseline gap-2 sm:gap-3">
                <IconBrandReddit className="h-10 sm:h-14 md:h-16 lg:h-[4.5rem] w-auto text-[#FF4500] inline-block relative top-1 sm:top-1.5 no-outline" />
                Reddit
              </span>
              {' '}leads
              <br />
              while you{' '}
              <span className="relative inline-block">
                <span className="relative z-10">sleep.</span>
                <span className="absolute bottom-1 sm:bottom-2 left-0 right-0 h-[0.35em] bg-orange-300/50 -z-0 rounded-sm" />
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
              AI monitors Reddit 24/7, finds high-intent conversations about your niche, and generates authentic replies that actually convert.
            </motion.p>

            {/* URL Input CTA */}
            <motion.div variants={fadeUp} className="max-w-lg mx-auto w-full">
              <div className="flex flex-col sm:flex-row gap-2 p-2.5 bg-white rounded-full border border-gray-200/80 shadow-[0_4px_32px_-8px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.03)]">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
                  <input
                    value={heroUrl}
                    onChange={(e) => setHeroUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleHeroUrlSubmit()}
                    placeholder="website.com"
                    className="w-full h-12 pl-11 pr-4 rounded-full bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <Button
                  ref={ctaRef}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-7 h-12 rounded-full text-[15px] font-semibold shadow-[0_4px_16px_-2px_rgba(234,88,12,0.4)] hover:shadow-[0_6px_24px_-2px_rgba(234,88,12,0.5)] transition-[box-shadow,background-color,scale] duration-200 flex items-center justify-center gap-2 group shrink-0"
                  onClick={handleHeroUrlSubmit}
                >
                  Find My Leads
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </motion.div>

            {/* Social proof - bigger avatars */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-col items-center gap-3">
              <div className="flex -space-x-3">
                {[11, 12, 13, 14, 15, 16, 17].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-[2.5px] border-[#FAFAF8] bg-gray-100 overflow-hidden shadow-sm">
                    <Image src={`https://i.pravatar.cc/100?img=${i}`} alt="" width={40} height={40} className="no-outline" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-gray-500 font-medium">
                Joined by <span className="text-gray-900 font-bold tabular-nums">100+</span> founders building in public
              </span>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-full pointer-events-none" />

            <div className="relative rounded-2xl border border-gray-200/60 bg-white shadow-2xl shadow-gray-200/40 overflow-hidden mx-auto max-w-5xl">
              {/* Browser chrome */}
              <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                </div>
                <div className="mx-auto bg-white border border-gray-100 rounded-md px-3 py-1 flex items-center gap-1.5 text-[11px] text-gray-400 w-52 justify-center">
                  <Search className="w-2.5 h-2.5" /> app.sneakyguy.com
                </div>
              </div>
              <Image
                src="/new Dashboard with analytics.png"
                alt="SneakyGuy Dashboard"
                width={1200}
                height={675}
                className="w-full h-auto no-outline"
                priority
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── LOGO STRIP / TRUST ───── */}
      <section className="py-12 border-y border-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-6">Powered by industry-leading AI</p>
          <div className="flex items-center justify-center gap-8 md:gap-14 opacity-40 grayscale">
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/></svg>
              <span className="text-sm font-semibold">OpenAI</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              <span className="text-sm font-semibold">Claude AI</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <IconBrandReddit className="h-5 w-5" />
              <span className="text-sm font-semibold">Reddit API</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-gray-600">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-semibold">Dodo Payments</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section id="how-it-works" className="py-20 md:py-28 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-[12px] font-semibold text-orange-600 uppercase tracking-[0.15em] mb-3">How it works</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-950 mb-4 leading-tight">Three steps to autopilot growth</h2>
              <p className="text-base text-gray-500 leading-relaxed">Set it up once. Let AI do the heavy lifting while you focus on building.</p>
            </motion.div>
          </div>

          {/* Animated Flow Diagram */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-14"
          >
            <HowItWorksAnimation />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: <Globe className="h-5 w-5" />,
                title: 'Paste Your URL',
                desc: 'Just drop your website link. Our AI scrapes your site, extracts brand info, and generates targeted keywords automatically.',
                detail: 'url: "https://yourproduct.com" → done',
              },
              {
                step: '02',
                icon: <Brain className="h-5 w-5" />,
                title: 'AI Scans Reddit',
                desc: 'Our engine analyzes thousands of posts, scoring each for buyer intent to surface perfect opportunities.',
                detail: '92% intent match found',
              },
              {
                step: '03',
                icon: <MessageSquare className="h-5 w-5" />,
                title: 'Reply & Convert',
                desc: 'Review AI-generated context-aware replies. One click to post an authentic response that converts.',
                detail: '"I built a tool for exactly this..."',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="premium-card p-7 h-full">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-[background-color,color,border-color] duration-300">
                      {item.icon}
                    </div>
                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Step {item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 tracking-tight">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{item.desc}</p>
                  <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 font-mono text-xs text-gray-500">
                    {item.detail}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── BENTO FEATURES ───── */}
      <section id="features" className="py-20 md:py-28 bg-gray-50/50 relative">
        <div className="absolute inset-0 grid-pattern" />

        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-[12px] font-semibold text-orange-600 uppercase tracking-[0.15em] mb-3">Features</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-950 mb-4 leading-tight">Everything you need to dominate Reddit</h2>
              <p className="text-base text-gray-500">No manual work. No spam. Just intelligent, automated lead generation.</p>
            </motion.div>
          </div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Large feature card */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="md:col-span-2 premium-card p-8 flex flex-col md:flex-row gap-8 items-center"
            >
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold mb-4">
                  <Brain className="h-3 w-3" /> AI Intent Engine
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Zero noise. Only buyer intent.</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  We don't just match keywords. Our AI reads the full context of every conversation, scoring leads on a 0-100 scale. You only see posts from users actively looking for a solution like yours.
                </p>
                <ul className="space-y-2">
                  {["Relevance scoring (0-100%)", "Sentiment analysis", "Context-aware replies", "One-click posting"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                  <Image src="/lead-dashboard-screenshot.png" alt="Lead scoring" width={500} height={350} className="w-full h-auto" />
                </div>
              </div>
            </motion.div>

            {/* Smaller cards */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="premium-card p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-5">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Setup in Seconds</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Just paste your URL. AI scrapes your site, generates keywords, and finds the best subreddits automatically.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.05 }}
              className="premium-card p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-5">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">24/7 Monitoring</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Never miss an opportunity. We scan Reddit continuously so you catch leads while competitors sleep.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}
              className="premium-card p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600 mb-5">
                <Bot className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Authentic AI Replies</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Fine-tune tone, style, and custom instructions. Every reply sounds human and adds genuine value.
              </p>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.15 }}
              className="md:col-span-2 lg:col-span-1 premium-card p-7"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-5">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Track mentions, monitor engagement, and see which keywords drive the most conversions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── COMPARISON (OLD vs NEW) ───── */}
      <section className="py-20 md:py-28 bg-gray-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 noise-bg opacity-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[150px]" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Stop the manual grind.</h2>
              <p className="text-base text-gray-400 max-w-lg mx-auto">See why founders are switching from hours of manual Reddit hunting to SneakyGuy's autopilot.</p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Old Way */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
              className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-7"
            >
              <div className="flex items-center gap-2.5 mb-7">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </div>
                <h3 className="text-base font-semibold text-gray-400">The Old Way</h3>
              </div>
              <ul className="space-y-5">
                {[
                  { title: 'Hours of manual searching', desc: 'Scrolling subreddits for mentions' },
                  { title: 'Struggling with replies', desc: 'Sounding genuine without getting banned' },
                  { title: 'Missing opportunities', desc: 'Leads gone while you were sleeping' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 opacity-60">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600 mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-300">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* SneakyGuy Way */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} transition={{ delay: 0.1 }}
              className="relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-7 shadow-2xl shadow-orange-500/20 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[60px]" />
              <div className="absolute inset-0 animate-shimmer" />

              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-7">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                    <Check strokeWidth={3} size={16} />
                  </div>
                  <h3 className="text-base font-semibold text-white">With SneakyGuy</h3>
                </div>
                <ul className="space-y-5">
                  {[
                    { title: '24/7 Autopilot', desc: 'AI monitors Reddit while you build' },
                    { title: 'Smart Intent Detection', desc: 'Only see hot leads, zero noise' },
                    { title: 'Instant Authentic Replies', desc: 'Context-aware, non-spammy responses' },
                    { title: 'One-Click Publishing', desc: 'Post directly from your dashboard' },
                    { title: 'X (Twitter) Integration', desc: 'Coming soon', badge: true },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <Check className="h-4 w-4 text-orange-200 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-orange-100">{item.desc}</p>
                          {item.badge && <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded">Soon</span>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── VIDEO DEMO ───── */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <p className="text-[12px] font-semibold text-orange-600 uppercase tracking-[0.15em] mb-3">Demo</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-950 mb-4">See it in action</h2>
              <p className="text-base text-gray-500">A 2-minute walkthrough of finding high-quality Reddit leads.</p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-200/60 bg-white"
          >
            <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src="https://www.loom.com/embed/01050bb0c0584256be51ddd489787480?sid=e4f38ddc-3d39-4627-8a78-b44f940d2b83"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                title="SneakyGuy Demo"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── SOCIAL PROOF ───── */}
      <SocialProof />

      {/* ───── PRICING ───── */}
      <section id="pricing" className="py-20 md:py-28 bg-gray-50/50 relative">
        <div className="absolute inset-0 grid-pattern" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <div className="text-center mb-14">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-[11px] font-semibold mb-4 border border-green-100">
                <Shield className="h-3 w-3" /> 7-Day Money-Back Guarantee
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-950 mb-4">Simple, transparent pricing</h2>
              <p className="text-base text-gray-500 max-w-lg mx-auto">One plan. Everything included. Pays for itself with a single converted lead.</p>
            </motion.div>
          </div>

          <PricingTable
            onPlanSelect={() => {
              if (user) router.push('/upgrade');
              else router.push('/login');
            }}
          />
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <FAQ />

      {/* ───── FINAL CTA ───── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white" />
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold tracking-tight text-gray-950 mb-4">
              Ready to find leads on autopilot?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-gray-500 mb-8 max-w-md mx-auto">
              Join 100+ founders who are growing their SaaS through intelligent Reddit engagement.
            </motion.p>
            <motion.div variants={fadeUp} className="max-w-md mx-auto w-full">
              <div className="flex gap-2 p-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/80 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)]">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={heroUrl}
                    onChange={(e) => setHeroUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleHeroUrlSubmit()}
                    placeholder="yourproduct.com"
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <Button
                  className="relative overflow-hidden bg-gradient-to-b from-orange-500 via-orange-600 to-orange-700 hover:from-orange-400 hover:via-orange-500 hover:to-orange-600 text-white px-5 h-11 rounded-xl text-sm font-semibold shadow-[0_4px_24px_-4px_rgba(234,88,12,0.5)] hover:shadow-[0_8px_32px_-4px_rgba(234,88,12,0.6)] transition-[box-shadow,scale,background] shrink-0 group border border-orange-400/30"
                  onClick={handleHeroUrlSubmit}
                >
                  <span className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.12] pointer-events-none" />
                  Start Free
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-3">7-day money-back guarantee. No hidden fees.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Image src="/logo.png" alt="SneakyGuy" width={24} height={24} />
                <span className="font-bold text-sm text-gray-900">SneakyGuy</span>
              </Link>
              <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
                AI-powered Reddit lead generation for founders who ship.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2">
                {[
                  { label: 'How it works', href: '#how-it-works' },
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'Blog', href: '/blog' },
                ].map(l => (
                  <li key={l.label}><a href={l.href} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">{l.label}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Terms of Service</Link></li>
                <li><a href="mailto:support@sneakyguy.com" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3">Connect</h4>
              <div className="flex gap-3">
                <a href="https://x.com/snow_stark17" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-200 transition-[color,border-color]">
                  <Twitter size={14} />
                </a>
                <a href="https://www.linkedin.com/in/sneakyguyai/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-200 transition-[color,border-color]">
                  <Linkedin size={14} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-gray-400">&copy; {new Date().getFullYear()} SneakyGuy. All rights reserved.</p>
            <p className="text-[11px] text-gray-400">Crafted for indie founders.</p>
          </div>
        </div>
      </footer>

      {/* ───── MOBILE STICKY CTA ───── */}
      <MobileStickyBar user={user} router={router} />
    </main>
  );
}

function MobileStickyBar({ user, router }: { user: any; router: any }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0, filter: 'blur(4px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: 12, opacity: 0, filter: 'blur(4px)', transition: { duration: 0.15, ease: 'easeIn' } }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <div className="bg-gray-950/95 backdrop-blur-xl border border-gray-800 shadow-2xl rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">Start free</p>
              <p className="text-sm font-bold text-white">Find Reddit leads</p>
            </div>
            <Button
              onClick={() => user ? router.push('/upgrade') : router.push('/login')}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold px-4 h-9 shadow-lg shadow-orange-500/30"
            >
              Get Started
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
