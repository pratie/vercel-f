'use client';

import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Brain,
  Target,
  MessageSquare,
  Bell,
  BarChart3,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect, useState, type SVGProps } from 'react';
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

// Reddit brand mark. Lucide ships no Reddit icon, so this inlines the outline
// path from Tabler Icons (MIT) that this page previously imported — same
// viewBox and stroke settings, so it renders pixel-identical.
function IconBrandReddit(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 8c2.648 0 5.028 .826 6.675 2.14a2.5 2.5 0 0 1 2.326 4.36c0 3.59 -4.03 6.5 -9 6.5c-4.875 0 -8.845 -2.8 -9 -6.294l-1 -.206a2.5 2.5 0 0 1 2.326 -4.36c1.646 -1.313 4.026 -2.14 6.674 -2.14z" />
      <path d="M12 8l1 -5l6 1" />
      <path d="M19 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
      <circle cx="9" cy="13" r=".5" fill="currentColor" />
      <circle cx="15" cy="13" r=".5" fill="currentColor" />
      <path d="M10 17c.667 .333 1.333 .5 2 .5s1.333 -.167 2 -.5" />
    </svg>
  );
}

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '/blog' },
];

const STEPS = [
  {
    title: 'Paste Your Website',
    body: 'We read your site and draft the keywords and subreddits worth watching — in about 20 seconds. Adjust anything you like.',
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

  const [heroUrl, setHeroUrl] = useState('');

  // The URL funnel: stash the URL, send them to sign in. The projects page
  // picks up pending_analyze_url and runs the analysis — before the paywall,
  // so new users see their own keywords first.
  const handleHeroAnalyze = () => {
    const raw = heroUrl.trim();
    if (!raw) {
      router.push(user ? '/projects' : '/login');
      return;
    }
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    sessionStorage.setItem('pending_analyze_url', normalized);
    router.push(user ? '/projects?analyze=true' : '/login');
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

      {/* ───── HERO ───── */}
      {/* Single centred column: one message, one action. The URL box IS the
          CTA — pasting a URL is lower-friction than "Get Started", and the
          analysis result (their own keywords) is the aha moment that sells. */}
      <section className="relative bg-paper overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(255,69,0,0.07),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-10 text-center">
          <h1 className="text-4xl sm:text-[52px] font-bold tracking-[-0.025em] text-ink-900 leading-[1.12] mb-5">
            People on Reddit are{' '}
            <span className="relative whitespace-nowrap">
              <span className="absolute inset-x-0 bottom-[0.08em] h-[0.35em] bg-orange-200/70 -rotate-[0.5deg]" aria-hidden="true" />
              <span className="relative">already asking</span>
            </span>{' '}
            for your product
          </h1>

          <p className="text-lg text-ink-600 mb-8 max-w-xl mx-auto leading-relaxed">
            Paste your website. SneakyGuy finds those conversations, scores the buying
            intent, and drafts replies that don&apos;t sound like ads.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleHeroAnalyze();
            }}
            className="max-w-xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(62,44,24,0.08),0_8px_30px_-8px_rgba(62,44,24,0.18)]">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" aria-hidden="true" />
                <input
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  placeholder="yourwebsite.com"
                  inputMode="url"
                  autoComplete="url"
                  aria-label="Your website URL"
                  className="w-full h-12 pl-10 pr-3 rounded-xl text-[15px] text-ink-900 placeholder:text-ink-300 focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="btn-primary h-12 px-6 text-[15px] shrink-0"
              >
                Find my leads
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-ink-400 justify-center">
            <span className="flex items-center">
              <Check className="h-4 w-4 text-emerald-500 mr-1.5 shrink-0" aria-hidden="true" />
              Free keyword &amp; community analysis
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-emerald-500 mr-1.5 shrink-0" aria-hidden="true" />
              AI-scored buying intent
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-emerald-500 mr-1.5 shrink-0" aria-hidden="true" />
              No subscription
            </span>
          </div>
        </div>

        {/* Product preview — a live-styled mock of the actual dashboard, so it
            never goes stale the way the old demo video did. Decorative. */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20" aria-hidden="true">
          <div className="rounded-2xl bg-white shadow-[0_0_0_1px_rgba(62,44,24,0.08),0_24px_60px_-20px_rgba(62,44,24,0.25)] overflow-hidden text-left">
            {/* window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#f0e9dd] bg-[#fbf8f3]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e8927c]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#9ec97f]/60" />
              <span className="ml-3 text-[11px] text-ink-300 font-medium truncate">sneakyguy.com — your leads</span>
            </div>

            <div className="p-4 sm:p-6 bg-paper">
              {/* mini stats */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {[
                  { label: 'Leads', value: '128', sub: '12 new today' },
                  { label: 'Avg match', value: '81%', sub: 'across scored' },
                  { label: 'High intent', value: '23', sub: 'reply first' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl shadow-card px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-ink-400">{s.label}</p>
                    <p className="text-lg font-bold text-ink-900 tabular-nums leading-tight">{s.value}</p>
                    <p className="text-[10px] text-ink-400 hidden sm:block">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* lead card 1 — hot */}
              <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(255,69,0,0.12),0_0_0_1px_rgba(255,69,0,0.14)] mb-3">
                <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300" />
                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="chip bg-orange-50 text-orange-700">r/smallbusiness</span>
                    <span className="chip bg-gradient-to-r from-orange-500 to-amber-500 text-white">⚡ Hot lead</span>
                    <span className="chip bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      92% · Strong match
                    </span>
                    <span className="chip bg-blue-50 text-blue-700 hidden sm:inline-flex">Solution seeking</span>
                  </div>
                  <p className="text-[13.5px] font-semibold text-ink-900 mb-1">
                    Any tool that finds customers talking about your niche on Reddit?
                  </p>
                  <p className="text-[12px] text-ink-600 line-clamp-1 mb-2.5">
                    I keep hearing Reddit is great for early customers but I don&apos;t have hours to scroll…
                  </p>
                  <div className="rounded-lg bg-[#fffaf6] border border-orange-100 px-3 py-2 text-[11.5px] text-ink-700">
                    <span className="font-bold text-orange-700/70 text-[10px] uppercase tracking-wider mr-1.5">Drafted reply</span>
                    Been there — I ended up automating this exact thing. Happy to share what worked…
                  </div>
                </div>
              </div>

              {/* lead card 2 — partially faded to suggest more below */}
              <div className="bg-white rounded-xl shadow-card p-4 opacity-70">
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className="chip bg-orange-50 text-orange-700">r/Entrepreneur</span>
                  <span className="chip bg-amber-50 text-amber-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    74% · Good match
                  </span>
                  <span className="chip bg-violet-50 text-violet-700 hidden sm:inline-flex">Recommendation</span>
                </div>
                <p className="text-[13.5px] font-semibold text-ink-900">
                  What&apos;s your best channel for B2B leads that isn&apos;t cold email?
                </p>
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
