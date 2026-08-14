'use client';

import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Globe,
  Menu,
  X,
} from 'lucide-react';
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

// The threads SneakyGuy catches, styled as they appear on Reddit. Two rows,
// split so each row loops over its own half. Illustrative, not live data.
const HERO_QUESTIONS: { sub: string; q: string }[] = [
  { sub: 'r/smallbusiness', q: 'Best alternative to HubSpot for a tiny team?' },
  { sub: 'r/ecommerce', q: 'Stripe alternative with lower fees?' },
  { sub: 'r/SaaS', q: 'How did you get your first 100 users?' },
  { sub: 'r/marketing', q: 'Cheaper Mailchimp alternative that doesn’t suck?' },
  { sub: 'r/startups', q: 'What CRM do you actually use day to day?' },
  { sub: 'r/nocode', q: 'Zapier is getting expensive, what else is there?' },
  { sub: 'r/freelance', q: 'Best invoicing tool for freelancers?' },
  { sub: 'r/shopify', q: 'App recommendations for abandoned carts?' },
  { sub: 'r/productivity', q: 'Is there a better scheduling tool than Calendly?' },
  { sub: 'r/webdev', q: 'What analytics do you use instead of GA4?' },
  { sub: 'r/Entrepreneur', q: 'QuickBooks alternative for a one-person business?' },
  { sub: 'r/socialmedia', q: 'Canva alternative for daily posts?' },
  { sub: 'r/sales', q: 'Anyone found a good Instantly alternative?' },
  { sub: 'r/CustomerSuccess', q: 'AI support bot that isn’t Intercom pricing?' },
  { sub: 'r/indiehackers', q: 'Where do you find early adopters besides PH?' },
  { sub: 'r/b2b_sales', q: 'Tools for finding warm leads without cold email?' },
];

function QuestionMarqueeRow({ items, reverse }: { items: { sub: string; q: string }[]; reverse?: boolean }) {
  // Content duplicated once so the -50% translate loops seamlessly.
  return (
    <div className="flex overflow-hidden">
      <div className={`flex gap-3 pr-3 w-max shrink-0 ${reverse ? 'animate-drift-reverse' : 'animate-drift'}`}>
        {[...items, ...items].map(({ sub, q }, i) => (
          <span
            key={i}
            className="flex items-center gap-2 shrink-0 bg-white rounded-full pl-1.5 pr-4 py-1.5 shadow-[0_0_0_1px_rgba(62,44,24,0.07),0_1px_3px_rgba(62,44,24,0.06)]"
          >
            <span className="chip bg-orange-50 text-orange-700">{sub}</span>
            <span className="text-[12.5px] text-ink-700 whitespace-nowrap">{q}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// The preview personalizes by what the visitor sells. Belief is specific:
// a Shopify founder doesn't trust a SaaS example, so let them pick their
// world and watch the dashboard fill with it.
const SEGMENTS = [
  {
    key: 'saas',
    label: 'SaaS',
    hotSub: 'r/SaaS',
    hotQ: 'Any tool that finds customers talking about your niche on Reddit?',
    hotBody: 'I keep hearing Reddit is great for early customers but I don’t have hours to scroll…',
    reply: 'Been there. I ended up automating this exact thing, happy to share what worked…',
    sub2: 'r/Entrepreneur',
    q2: 'What’s your best channel for B2B leads that isn’t cold email?',
    intent2: 'Recommendation',
  },
  {
    key: 'ecom',
    label: 'E-commerce',
    hotSub: 'r/shopify',
    hotQ: 'How do you get sales without burning money on Meta ads?',
    hotBody: 'CPMs are killing me. Two products, decent reviews, but paid is eating all my margin…',
    reply: 'Same boat last year. What actually moved the needle for us was showing up where people already ask…',
    sub2: 'r/ecommerce',
    q2: 'Best tool for finding what customers complain about in my niche?',
    intent2: 'Solution seeking',
  },
  {
    key: 'agency',
    label: 'Agencies',
    hotSub: 'r/smallbusiness',
    hotQ: 'How do I find clients who actually value marketing help?',
    hotBody: 'Referrals dried up this quarter. Cold email gets 1% replies. Where are people actually asking for help?',
    reply: 'Honestly, half my clients came from answering questions like this one…',
    sub2: 'r/agency',
    q2: 'Where do you find leads besides Upwork and referrals?',
    intent2: 'Recommendation',
  },
  {
    key: 'creator',
    label: 'Courses & creators',
    hotSub: 'r/growmybusiness',
    hotQ: 'Is there a way to find people asking about topics I teach?',
    hotBody: 'I have a course that genuinely helps but I refuse to run ads. Want to help people already asking…',
    reply: 'This is exactly how I sold my first 50 seats. Found the threads, answered properly…',
    sub2: 'r/coursecreators',
    q2: 'How do you promote a course without feeling spammy?',
    intent2: 'Solution seeking',
  },
];

const STEPS = [
  {
    title: 'Paste Your Website',
    body: 'We read your site and draft the keywords and subreddits worth watching, in about 20 seconds. Adjust anything you like.',
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

// Each feature leads with a fragment of the actual product UI instead of a
// stock icon — show the thing, don't symbolise it.
const FEATURES: { title: string; body: string; visual: React.ReactNode }[] = [
  {
    title: 'Smart Keyword Discovery',
    body: 'AI suggests the keywords your buyers actually type, not the ones you wish they did.',
    visual: (
      <div className="flex flex-wrap gap-1.5">
        <span className="chip bg-cream text-ink-700">stripe alternative</span>
        <span className="chip bg-cream text-ink-700">lower fees</span>
        <span className="chip bg-cream text-ink-700">payment setup</span>
        <span className="chip bg-white text-ink-300 border border-dashed border-[#d8cfc0]">+ add your own</span>
      </div>
    ),
  },
  {
    title: 'Subreddit Targeting',
    body: 'Find the communities where your audience already hangs out, ranked by relevance.',
    visual: (
      <div className="flex flex-wrap gap-1.5">
        <span className="chip bg-orange-50 text-orange-700">r/ecommerce</span>
        <span className="chip bg-orange-50 text-orange-700">r/smallbusiness</span>
        <span className="chip bg-orange-50 text-orange-700">r/SaaS</span>
        <span className="chip bg-orange-50 text-orange-700">r/startups</span>
      </div>
    ),
  },
  {
    title: 'Relevancy Scoring',
    body: 'Every mention is scored for buying intent, so low-value noise never reaches your dashboard.',
    visual: (
      <div className="flex flex-wrap gap-1.5">
        <span className="chip bg-emerald-50 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          92% · Strong match
        </span>
        <span className="chip bg-stone-100 text-stone-500">
          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
          31% · Weak match
        </span>
      </div>
    ),
  },
  {
    title: 'AI Reply Generation',
    body: 'Context-aware replies that read like a helpful human, matched to your chosen tone.',
    visual: (
      <div className="rounded-lg bg-[#fffaf6] border border-orange-100 px-3 py-2 text-[11.5px] text-ink-700 text-left">
        <span className="font-bold text-orange-700/70 text-[10px] uppercase tracking-wider mr-1.5">Drafted reply</span>
        Been there. Happy to share what worked for us…
      </div>
    ),
  },
  {
    title: 'Instant Alerts',
    body: 'Email and Telegram alerts the moment a high-intent conversation appears.',
    visual: (
      <div className="flex items-center gap-2 rounded-lg bg-cream px-3 py-2 text-[11.5px] text-ink-700">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
        </span>
        New high-intent lead in r/SaaS
        <span className="ml-auto text-ink-300 text-[10.5px]">just now</span>
      </div>
    ),
  },
  {
    title: 'Analytics',
    body: 'Track mentions, keyword performance and engagement over time in one place.',
    visual: (
      <div className="space-y-1.5">
        {[
          { label: 'r/ecommerce', w: 'w-4/5' },
          { label: 'r/smallbusiness', w: 'w-3/5' },
          { label: 'r/SaaS', w: 'w-2/5' },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="text-[10.5px] text-ink-400 w-24 shrink-0 truncate text-left">{r.label}</span>
            <span className="h-1.5 flex-1 rounded-full bg-cream overflow-hidden">
              <span className={`block h-full ${r.w} rounded-full bg-gradient-to-r from-orange-400 to-orange-600`} />
            </span>
          </div>
        ))}
      </div>
    ),
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
  const [segment, setSegment] = useState(SEGMENTS[0]);

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
      {/* Full-width bar: logo anchored left, links centred, CTA anchored right. */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#f0e9dd]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2" aria-label="SneakyGuy home">
              <Image
                src="/logo.png"
                alt=""
                width={44}
                height={logoHeight(44)}
                priority
                className="h-auto w-11 no-outline"
              />
              <span className="font-bold text-xl text-ink-900 tracking-tight">SneakyGuy</span>
            </Link>

            <nav
              className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
              aria-label="Main"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13.5px] text-ink-600 hover:text-ink-900 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5">
              <button onClick={handleGetStarted} className="btn-primary h-10 px-5 text-sm">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className="md:hidden p-2 -mr-2 text-ink-600"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="md:hidden border-t border-[#f0e9dd] py-3 flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-ink-600 hover:text-ink-900 font-medium"
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
      <section className="relative bg-white overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-10 text-center">
          <h1 className="text-[40px] sm:text-[60px] font-bold tracking-[-0.03em] text-ink-900 leading-[1.08] mb-6">
            People on Reddit are{' '}
            <em className="font-display font-medium italic tracking-[-0.01em] text-orange-600 whitespace-nowrap">
              already asking
            </em>{' '}
            for your product
          </h1>

          <p className="text-lg text-ink-600 mb-9 max-w-xl mx-auto leading-relaxed">
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
            <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-white rounded-2xl shadow-[0_0_0_1px_rgba(62,44,24,0.08),0_8px_30px_-8px_rgba(62,44,24,0.18)] focus-within:shadow-[0_0_0_2px_rgba(255,69,0,0.25),0_8px_30px_-8px_rgba(62,44,24,0.18)] transition-shadow duration-200">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" aria-hidden="true" />
                <input
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  placeholder="yourwebsite.com"
                  inputMode="url"
                  autoComplete="url"
                  aria-label="Your website URL"
                  className="w-full h-12 pl-10 pr-10 rounded-xl text-[15px] text-ink-900 placeholder:text-ink-300 focus:outline-none bg-transparent"
                />
                <kbd
                  className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-ink-300 border border-[#e9e1d4] rounded-md px-1.5 py-0.5"
                  aria-hidden="true"
                >
                  ⏎
                </kbd>
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

        {/* Question drift — the threads this product exists for. Edge-faded,
            slow, pauses on hover. Decorative for screen readers. */}
        <div className="relative mt-10 mb-2 marquee-paused" aria-hidden="true">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-ink-300 mb-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500" />
              </span>
              Asked on Reddit every hour
            </span>
          </p>
          <div className="space-y-3">
            <QuestionMarqueeRow items={HERO_QUESTIONS.slice(0, 8)} />
            <QuestionMarqueeRow items={HERO_QUESTIONS.slice(8)} reverse />
          </div>
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
        </div>

        {/* Product preview — a live-styled mock of the actual dashboard, so it
            never goes stale the way the old demo video did. The segment picker
            personalizes it: belief is specific to what the visitor sells. */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
            <span className="text-[12.5px] text-ink-400 mr-1.5">Show me leads for</span>
            {SEGMENTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSegment(s)}
                aria-pressed={segment.key === s.key}
                className={`px-3.5 h-8 rounded-full text-[12.5px] font-semibold transition-all duration-200 ${
                  segment.key === s.key
                    ? 'bg-ink-900 text-white shadow-[0_2px_8px_-2px_rgba(36,29,21,0.4)]'
                    : 'bg-white text-ink-600 shadow-[0_0_0_1px_rgba(62,44,24,0.08)] hover:text-ink-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl bg-white shadow-[0_0_0_1px_rgba(62,44,24,0.08),0_32px_80px_-24px_rgba(62,44,24,0.3)] overflow-hidden text-left"
          >
            {/* window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#f0e9dd] bg-[#fbf8f3]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e8927c]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#9ec97f]/60" />
              <span className="ml-3 text-[11px] text-ink-300 font-medium truncate">sneakyguy.com / your leads</span>
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

              {/* Segment-driven lead cards. Keyed so the swap animates. */}
              <motion.div
                key={segment.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* lead card 1 — hot */}
                <div className="bg-white rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(255,69,0,0.12),0_0_0_1px_rgba(255,69,0,0.14)] mb-3">
                  <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-300" />
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <span className="chip bg-orange-50 text-orange-700">{segment.hotSub}</span>
                      <span className="chip bg-gradient-to-r from-orange-500 to-amber-500 text-white">⚡ Hot lead</span>
                      <span className="chip bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        92% · Strong match
                      </span>
                      <span className="chip bg-blue-50 text-blue-700 hidden sm:inline-flex">Solution seeking</span>
                    </div>
                    <p className="text-[13.5px] font-semibold text-ink-900 mb-1">
                      {segment.hotQ}
                    </p>
                    <p className="text-[12px] text-ink-600 line-clamp-1 mb-2.5">
                      {segment.hotBody}
                    </p>
                    <div className="rounded-lg bg-[#fffaf6] border border-orange-100 px-3 py-2 text-[11.5px] text-ink-700">
                      <span className="font-bold text-orange-700/70 text-[10px] uppercase tracking-wider mr-1.5">Drafted reply</span>
                      {segment.reply}
                    </div>
                  </div>
                </div>

                {/* lead card 2 — partially faded to suggest more below */}
                <div className="bg-white rounded-xl shadow-card p-4 opacity-70">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="chip bg-orange-50 text-orange-700">{segment.sub2}</span>
                    <span className="chip bg-amber-50 text-amber-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      74% · Good match
                    </span>
                    <span className="chip bg-violet-50 text-violet-700 hidden sm:inline-flex">{segment.intent2}</span>
                  </div>
                  <p className="text-[13.5px] font-semibold text-ink-900">
                    {segment.q2}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── SOCIAL PROOF ───── */}
      <SocialProof />

      {/* ───── HOW IT WORKS ───── */}
      <section id="how-it-works" className="py-24 bg-white scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600 mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-ink-900">
              From your URL to your first reply,{' '}
              <em className="font-display font-medium italic text-orange-600">in minutes</em>
            </h2>
          </div>

          <ol className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="relative bg-white rounded-2xl shadow-card p-6 text-left"
              >
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-50 text-orange-700 text-[12px] font-bold tabular-nums mb-4"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="text-[16px] font-semibold text-ink-900 mb-1.5">{step.title}</h3>
                <p className="text-[14px] text-ink-600 leading-relaxed">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="py-24 bg-paper scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600 mb-3">The toolkit</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-ink-900">
              Leads from Reddit,{' '}
              <em className="font-display font-medium italic text-orange-600">without living on Reddit</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ title, body, visual }) => (
              <div
                key={title}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-[box-shadow] duration-300 p-6"
              >
                <div className="mb-4 min-h-[52px] flex items-center" aria-hidden="true">
                  <div className="w-full">{visual}</div>
                </div>
                <h3 className="text-[15px] font-semibold text-ink-900 mb-1.5">{title}</h3>
                <p className="text-sm text-ink-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="pricing" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-600 mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-ink-900">
              One plan.{' '}
              <em className="font-display font-medium italic text-orange-600">No subscription.</em>
            </h2>
            <p className="mt-3 text-base text-ink-600 max-w-2xl mx-auto">
              Everything included, one-time payment.
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
      {/* The page's one moment of drama: a deep warm-ink panel that repeats
          the URL device from the hero for people who scrolled all the way. */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto overflow-hidden rounded-3xl bg-[#211a13] px-6 py-14 sm:px-14 sm:py-16 text-center"
        >
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,110,43,0.18),transparent_65%)]"
            aria-hidden="true"
          />
          <h2 className="relative text-3xl sm:text-[40px] font-bold tracking-[-0.025em] text-white leading-tight mb-3">
            Your next customer posted{' '}
            <em className="font-display font-medium italic text-orange-400">today</em>
          </h2>
          <p className="relative text-[15px] text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
            Paste your website and see the conversations you&apos;ve been missing.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleHeroAnalyze();
            }}
            className="relative max-w-lg mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-white/[0.07] backdrop-blur rounded-2xl ring-1 ring-white/15">
              <input
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                placeholder="yourwebsite.com"
                inputMode="url"
                aria-label="Your website URL"
                className="flex-1 h-12 px-4 rounded-xl text-[15px] text-white placeholder:text-white/35 focus:outline-none bg-transparent"
              />
              <button type="submit" className="btn-primary h-12 px-6 text-[15px] shrink-0">
                Find my leads
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
          <p className="relative text-[11.5px] text-white/40 mt-4">
            Free analysis · No subscription · 7-day money-back guarantee
          </p>
        </motion.div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-[#f0e9dd] bg-white">
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
              <span className="font-bold text-ink-900">SneakyGuy</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-600">
              <Link href="/blog" className="hover:text-ink-900">Blog</Link>
              <Link href="/about" className="hover:text-ink-900">About</Link>
              <Link href="/privacy" className="hover:text-ink-900">Privacy</Link>
              <Link href="/terms" className="hover:text-ink-900">Terms</Link>
            </nav>

            <p className="text-sm text-ink-400">
              © {new Date().getFullYear()} SneakyGuy
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
