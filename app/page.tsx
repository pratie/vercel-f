'use client';

import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Sparkles,
  Brain,
  Target,
  MessageSquare,
  Bell,
  BarChart3,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { IconBrandReddit } from '@tabler/icons-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SocialProof from '@/components/SocialProof';
import { PricingTable } from '@/components/PricingTable';
import { FAQ } from './components/FAQ';

// The logo is a 544x336 transparent PNG of the guy peeking over an edge.
// Keep this ratio wherever it renders -- forcing it into a square crushes him
// and loses the "peeking over the page" effect that makes it sit on white.
// It also needs the `no-outline` class: globals.css puts a 1px outline on every
// img, which draws a visible rectangle around the transparent areas.
const LOGO_RATIO = 336 / 544;
const logoHeight = (width: number) => Math.round(width * LOGO_RATIO);

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '/blog' },
];

const STEPS = [
  {
    title: 'Set Up Your Keywords',
    body: 'Describe your business and SneakyGuy generates the keywords and subreddits worth watching. Adjust anything you like.',
  },
  {
    title: 'AI Monitors Reddit 24/7',
    body: 'We scan matching conversations around the clock and score each one for buying intent, so you only see what matters.',
  },
  {
    title: 'Reply and Convert',
    body: 'Get a suggested reply written in your tone for every lead. Review it, edit it, and post without sounding like a bot.',
  },
];

const FEATURES = [
  {
    icon: Target,
    title: 'Smart Keyword Discovery',
    body: 'AI suggests the keywords your buyers actually type, not the ones you wish they did.',
  },
  {
    icon: IconBrandReddit,
    title: 'Subreddit Targeting',
    body: 'Find the communities where your audience already hangs out, ranked by relevance.',
  },
  {
    icon: Brain,
    title: 'Relevancy Scoring',
    body: 'Every mention is scored for intent so low-value noise never reaches your dashboard.',
  },
  {
    icon: MessageSquare,
    title: 'AI Reply Generation',
    body: 'Context-aware replies that read like a helpful human, matched to your chosen tone.',
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    body: 'Email and Telegram alerts the moment a high-intent conversation appears.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    body: 'Track mentions, keyword performance and engagement over time in one place.',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user && pathname === '/') {
      router.push('/projects');
    }
  }, [user, router, pathname]);

  const handleGetStarted = () => {
    router.push(user ? '/upgrade' : '/login');
  };

  return (
    <main className="min-h-screen bg-white">
      {/* ───── NAVIGATION ───── */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2" aria-label="SneakyGuy home">
              <Image
                src="/logo.png"
                alt=""
                width={44}
                height={logoHeight(44)}
                priority
                className="h-auto w-11 no-outline"
              />
              <span className="font-bold text-xl text-gray-900">SneakyGuy</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8" aria-label="Main">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-gray-500 hover:text-gray-950 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Button
                className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white"
                onClick={handleGetStarted}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="md:hidden p-2 -mr-2 text-gray-600"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="md:hidden border-t border-gray-100 py-3 flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-gray-600 hover:text-gray-950 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* ───── ANNOUNCEMENT BAR ───── */}
      {/* A full-bleed orange bar competed with the CTA for attention. A single
          small dot carries the "new" signal without shouting. */}
      <div className="border-b border-gray-100 bg-white py-2.5 px-4 text-center">
        <p className="text-[13px] text-gray-500 inline-flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff4500] shrink-0" aria-hidden="true" />
          AI-powered reply generation is live — find leads and respond in one place.
        </p>
      </div>

      {/* ───── HERO ───── */}
      <section className="relative bg-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="text-center lg:text-left lg:col-span-6 lg:flex lg:items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-medium bg-gray-50 border border-gray-200/70 text-gray-600 mb-8">
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-[#ff4500]" aria-hidden="true" />
                  <span>AI-Powered Lead Generation</span>
                </div>

                {/* One accent in the headline -- the Reddit mark. The second
                    line used to be solid orange, which fought the CTA. */}
                <h1 className="text-4xl sm:text-5xl font-bold tracking-[-0.02em] text-gray-950 mb-6 leading-[1.15]">
                  <span className="inline-flex items-center gap-2 sm:gap-3">
                    Find
                    <IconBrandReddit
                      className="h-9 sm:h-11 w-auto text-[#ff4500] shrink-0"
                      aria-hidden="true"
                    />
                    Reddit Leads
                  </span>
                  <br />
                  {/* Kept at full strength. A lighter grey here read as
                      disabled text and failed contrast at this size. */}
                  While You Sleep
                </h1>

                <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  SneakyGuy helps founders and B2B teams discover and convert qualified leads from
                  Reddit discussions, with AI-powered monitoring and reply generation.
                </p>

                <div className="sm:flex sm:justify-center lg:justify-start gap-4">
                  <Button
                    className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-7 h-12 rounded-xl text-base font-semibold w-full sm:w-auto"
                    onClick={handleGetStarted}
                  >
                    Find Leads Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-gray-500 justify-center lg:justify-start">
                  <span className="flex items-center">
                    <Check className="h-4 w-4 text-gray-400 mr-2 shrink-0" aria-hidden="true" />
                    AI-powered lead generation
                  </span>
                  <span className="flex items-center">
                    <Check className="h-4 w-4 text-gray-400 mr-2 shrink-0" aria-hidden="true" />
                    24/7 Reddit monitoring
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="relative mx-auto w-full rounded-2xl shadow-lg overflow-hidden bg-white">
                <div style={{ position: 'relative', paddingBottom: '51.67%', height: 0 }}>
                  <iframe
                    src="https://www.loom.com/embed/01050bb0c0584256be51ddd489787480?sid=e4f38ddc-3d39-4627-8a78-b44f940d2b83"
                    allowFullScreen
                    /* Not lazy: this sits above the fold, and deferring it
                       leaves a blank white panel next to the headline on
                       first paint. */
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    title="SneakyGuy product demo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SOCIAL PROOF ───── */}
      <SocialProof />

      {/* ───── HOW IT WORKS ───── */}
      <section id="how-it-works" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-gray-950">How SneakyGuy Works</h2>
            <p className="mt-3 text-base text-gray-500 max-w-2xl mx-auto">
              Reddit lead generation on autopilot, in three steps.
            </p>
          </div>

          {/* Ghosted numerals instead of filled orange circles: the step
              sequence still reads, without three more accent blobs. */}
          <ol className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
            {STEPS.map((step, i) => (
              <li key={step.title} className="text-center lg:text-left">
                <span className="block text-3xl font-bold text-gray-200 tabular-nums mb-4" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-lg font-semibold text-gray-950 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="py-20 bg-gray-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-gray-950">Everything you need to track and engage</h2>
            <p className="mt-3 text-base text-gray-500 max-w-2xl mx-auto">
              Built for people who want leads from Reddit without living on Reddit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-gray-200/80 p-6 hover:border-gray-300 transition-colors"
              >
                {/* Bare icon, no peach tile. The orange stays as a small mark. */}
                <Icon className="h-5 w-5 text-[#ff4500] mb-4" aria-hidden="true" />
                <h3 className="text-[15px] font-semibold text-gray-950 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="pricing" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-[-0.02em] text-gray-950">Simple, honest pricing</h2>
            <p className="mt-3 text-base text-gray-500 max-w-2xl mx-auto">
              One plan, everything included. One-time payment, no subscription.
            </p>
          </div>

          <PricingTable
            onPlanSelect={() => {
              router.push(user ? '/upgrade' : '/login');
            }}
          />
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <FAQ />

      {/* ───── FINAL CTA ───── */}
      {/* Was a full orange gradient panel. White with a hairline rule lets the
          one orange button actually be the loudest thing on the page. */}
      <section className="py-20 sm:py-28 border-t border-gray-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-gray-950 mb-4">
            Ready to grow on Reddit?
          </h2>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Let AI find the conversations worth joining, and draft the reply for you.
          </p>
          <Button
            onClick={handleGetStarted}
            className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white font-semibold px-7 h-12 rounded-xl text-base"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt=""
                width={28}
                height={logoHeight(28)}
                className="h-auto w-7 no-outline"
              />
              <span className="font-bold text-gray-900">SneakyGuy</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
              <Link href="/blog" className="hover:text-gray-950">Blog</Link>
              <Link href="/about" className="hover:text-gray-950">About</Link>
              <Link href="/privacy" className="hover:text-gray-950">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-950">Terms</Link>
            </nav>

            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} SneakyGuy
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
