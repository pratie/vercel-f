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
                  className="text-gray-600 hover:text-[#ff4500] font-medium transition-colors"
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
                  className="py-2 text-gray-600 hover:text-[#ff4500] font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* ───── ANNOUNCEMENT BAR ───── */}
      <div className="bg-[#ff4500] text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          AI-powered reply generation is live — find leads and respond in one place.
        </p>
      </div>

      {/* ───── HERO ───── */}
      <section className="relative bg-gradient-to-b from-white to-gray-50">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute inset-y-0 right-0 w-1/2">
            <div className="h-full bg-gradient-to-r from-transparent to-[#fff3f0]/20" />
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12">
            <div className="text-center lg:text-left lg:col-span-6 lg:flex lg:items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[#ff4500]/10 text-[#ff4500] mb-8">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span>AI-Powered Lead Generation</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
                  <span className="inline-flex items-center gap-2 sm:gap-3">
                    Find
                    <IconBrandReddit
                      className="h-9 sm:h-11 w-auto text-[#ff4500] shrink-0"
                      aria-hidden="true"
                    />
                    Reddit Leads
                  </span>
                  <br />
                  <span className="text-[#ff4500]">While You Sleep</span>
                </h1>

                <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                  SneakyGuy helps founders and B2B teams discover and convert qualified leads from
                  Reddit discussions, with AI-powered monitoring and reply generation.
                </p>

                <div className="sm:flex sm:justify-center lg:justify-start gap-4">
                  <Button
                    className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-8 py-4 rounded-full text-lg font-medium w-full sm:w-auto shadow-lg shadow-[#ff4500]/20"
                    onClick={handleGetStarted}
                  >
                    Find Leads Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 justify-center lg:justify-start">
                  <span className="flex items-center">
                    <Check className="h-5 w-5 text-[#ff4500] mr-2 shrink-0" />
                    AI-powered lead generation
                  </span>
                  <span className="flex items-center">
                    <Check className="h-5 w-5 text-[#ff4500] mr-2 shrink-0" />
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
                    loading="lazy"
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
            <h2 className="text-3xl font-bold text-gray-900">How SneakyGuy Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Reddit lead generation on autopilot, in three steps.
            </p>
          </div>

          <div className="relative">
            <div
              className="hidden lg:block absolute top-14 left-0 right-0 h-px bg-gradient-to-r from-[#ff4500]/0 via-[#ff4500]/40 to-[#ff4500]/0"
              aria-hidden="true"
            />

            <ol className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="bg-[#fff3f0] rounded-full w-12 h-12 flex items-center justify-center mb-6 mx-auto lg:mx-0">
                    <span className="text-[#ff4500] font-bold text-xl">{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center lg:text-left">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center lg:text-left leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="py-20 bg-gray-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to track and engage</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Built for people who want leads from Reddit without living on Reddit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#ff4500]/30 hover:shadow-md transition-all"
              >
                <div className="bg-[#fff3f0] rounded-lg w-11 h-11 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[#ff4500]" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="pricing" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Simple, honest pricing</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
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
      <section className="py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#ff4500] to-[#ff6b3d] rounded-2xl p-8 sm:p-12 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to grow on Reddit?</h2>
            <p className="text-white/90 mb-8 max-w-xl mx-auto">
              Let AI find the conversations worth joining, and draft the reply for you.
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-white text-[#ff4500] hover:bg-white/90 font-semibold px-8 py-3 rounded-full"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
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
              <Link href="/blog" className="hover:text-[#ff4500]">Blog</Link>
              <Link href="/about" className="hover:text-[#ff4500]">About</Link>
              <Link href="/privacy" className="hover:text-[#ff4500]">Privacy</Link>
              <Link href="/terms" className="hover:text-[#ff4500]">Terms</Link>
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
