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
// and loses the "peeking over the page" effect. The peach fill and the heavy
// black outlines were composited to read on warm near-black, which is exactly
// the canvas this page now uses, so the asset is unchanged.
// It also needs the `no-outline` class: globals.css puts a 1px outline on every
// img, which draws a visible rectangle around the transparent areas.
const LOGO_RATIO = 336 / 544;
const logoHeight = (width: number) => Math.round(width * LOGO_RATIO);

// ---------------------------------------------------------------------------
// PALETTE
//
// The whole pre-purchase path (landing -> /explore) is one dark room. Every
// colour below is a literal arbitrary value, deliberately NOT a Tailwind config
// key, and it is the same set /explore uses:
//
//   canvas       #0c0a09   warm near-black, never neutral or blue-black
//   panel        #1c1917   anything that used to be a white card
//   panel-raised #292524   controls, chips and mock UI sitting on a panel
//   border       white/[0.08]
//   text-hi      #fafaf9   headlines, values, names
//   text         #d6d3d1   body copy a buyer has to read
//   text-muted   #a8a29e   secondary labels
//   text-dim     #78716c   placeholders, footnotes, decoration
//   brand        #ff4500   CTAs and brand moments only, kept precious
//   live/ok      #34d399   ticks and status only, never a CTA
//
// Shadows do almost nothing on this canvas, so separation comes from the border
// and the raised surface. The old warm shadow stacks were removed rather than
// left in place doing invisible work.
// ---------------------------------------------------------------------------

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
            className="flex items-center gap-2 shrink-0 bg-[#1c1917] border border-white/[0.08] rounded-full pl-1.5 pr-4 py-1.5"
          >
            <span className="chip bg-[#ff4500]/[0.12] text-[#ff4500]">{sub}</span>
            <span className="text-[12.5px] text-[#d6d3d1] whitespace-nowrap">{q}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// chatgptNames / perplexityNames are REAL recorded answers, queried through
// the same engine the product uses. Top three per engine: the tails carried
// extraction noise. Re-record them if the category shifts.
// The preview personalizes by what the visitor sells. Belief is specific:
// a Shopify founder doesn't trust a SaaS example, so let them pick their
// world and watch the dashboard fill with it.
const SEGMENTS = [
  {
    key: 'saas',
    askedQ: 'What are the best reddit monitoring tools?',
    chatgptNames: ['Linkeddit', 'RedShip', 'MentionDrop'],
    perplexityNames: ['Syften', 'F5Bot', 'Brand24'],
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
    askedQ: 'What are the best shopify marketing tools?',
    chatgptNames: ['Triple Whale', 'Klaviyo', 'Omnisend'],
    perplexityNames: ['Klaviyo', 'Omnisend', 'Shopify Flow'],
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
    askedQ: 'What are the best agency lead gen tools?',
    chatgptNames: ['Honeytrail', 'AgencyRadar', 'Leadspicker'],
    perplexityNames: ['Apollo', 'ZoomInfo', 'Hunter.io'],
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
    askedQ: 'What are the best course marketing tools?',
    chatgptNames: ['LearnWorlds', 'Kartra', 'FreshLearn'],
    perplexityNames: ['Kajabi', 'Thinkific', 'Teachable'],
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

// The demonstration that sells AI visibility. We ran this question on the
// day the check shipped and kept the answers exactly as they came back. The
// verdict line reads "Your product", not our own name: the recorded answers
// are real, and the reader is meant to put themselves in that empty slot
// rather than watch us talk about ourselves on our own sales page.
const AI_PROMPT = 'What are the best tools to find leads on Reddit?';

// dotClass is the engine's own identity colour, kept because it makes the two
// panels instantly tellable apart. headerClass is the raised surface the engine
// name sits on: on dark there is no tinted-wash equivalent, so both use the
// panel-raised tone and the dot carries the identity alone.
const AI_ANSWERS: {
  engine: string;
  dotClass: string;
  headerClass: string;
  named: string[];
}[] = [
  {
    engine: 'ChatGPT',
    dotClass: 'bg-[#34d399]',
    headerClass: 'bg-[#292524]',
    named: ['Leado', 'Leadline', 'Optareach', 'LeadSnipe', 'Leadmatically'],
  },
  {
    engine: 'Perplexity',
    dotClass: 'bg-[#38bdf8]',
    headerClass: 'bg-[#292524]',
    named: ['Linkeddit', 'CommunityTracker', 'RedReach', 'Buska', 'Syften'],
  },
];

const AI_ENGINES = ['ChatGPT', 'Perplexity', 'Gemini', 'Claude'];

// The three beats of the product. Find it, join it, get named for it.
const STEPS = [
  {
    title: 'Find the conversation',
    body: 'Paste your website. We draft the keywords and subreddits worth watching in about 20 seconds, then scan those subreddits and score every thread for buying intent.',
  },
  {
    title: 'Join it in your own voice',
    body: 'Every lead arrives with a drafted reply in your tone. Edit it, post it, and be the useful answer in the thread instead of the ad next to it.',
  },
  {
    title: 'Track whether AI names you',
    body: 'We ask the assistants the buying questions your customers ask and record which products get named. As the threads add up, watch your name show up.',
  },
];

// Each feature leads with a fragment of the actual product UI instead of a
// stock icon — show the thing, don't symbolise it. These mocks are the easiest
// thing to miss in a repaint: a light-on-light fragment inside a dark card
// reads as a rendering bug, so every inner surface is re-toned too.
const FEATURES: { title: string; body: string; visual: React.ReactNode }[] = [
  {
    title: 'Smart Keyword Discovery',
    body: 'AI suggests the keywords your buyers actually type, not the ones you wish they did.',
    visual: (
      <div className="flex flex-wrap gap-1.5">
        <span className="chip bg-[#292524] text-[#d6d3d1]">stripe alternative</span>
        <span className="chip bg-[#292524] text-[#d6d3d1]">lower fees</span>
        <span className="chip bg-[#292524] text-[#d6d3d1]">payment setup</span>
        <span className="chip bg-transparent text-[#78716c] border border-dashed border-white/[0.16]">+ add your own</span>
      </div>
    ),
  },
  {
    title: 'Subreddit Targeting',
    body: 'Find the communities where your audience already hangs out, ranked by relevance.',
    visual: (
      <div className="flex flex-wrap gap-1.5">
        <span className="chip bg-[#ff4500]/[0.12] text-[#ff4500]">r/ecommerce</span>
        <span className="chip bg-[#ff4500]/[0.12] text-[#ff4500]">r/smallbusiness</span>
        <span className="chip bg-[#ff4500]/[0.12] text-[#ff4500]">r/SaaS</span>
        <span className="chip bg-[#ff4500]/[0.12] text-[#ff4500]">r/startups</span>
      </div>
    ),
  },
  {
    title: 'Relevancy Scoring',
    body: 'Every mention is scored for buying intent, so low-value noise never reaches your dashboard.',
    visual: (
      <div className="flex flex-wrap gap-1.5">
        <span className="chip bg-[#34d399]/[0.12] text-[#34d399]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
          92% · Strong match
        </span>
        <span className="chip bg-white/[0.06] text-[#a8a29e]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#57534e]" />
          31% · Weak match
        </span>
      </div>
    ),
  },
  {
    title: 'AI Reply Generation',
    body: 'Context-aware replies that read like a helpful human, matched to your chosen tone.',
    visual: (
      <div className="rounded-lg bg-[#ff4500]/[0.07] border border-[#ff4500]/20 px-3 py-2 text-[11.5px] text-[#d6d3d1] text-left">
        <span className="font-bold text-[#ff4500] text-[10px] uppercase tracking-wider mr-1.5">Drafted reply</span>
        Been there. Happy to share what worked for us…
      </div>
    ),
  },
  {
    title: 'Instant Alerts',
    body: 'Email and Telegram alerts the moment a high-intent conversation appears.',
    visual: (
      <div className="flex items-center gap-2 rounded-lg bg-[#292524] px-3 py-2 text-[11.5px] text-[#d6d3d1]">
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4500] opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ff4500]" />
        </span>
        New high-intent lead in r/SaaS
        <span className="ml-auto text-[#78716c] text-[10.5px]">just now</span>
      </div>
    ),
  },
  {
    title: 'AI Visibility Tracking',
    body: 'We put your buying questions to the assistants and record which products get named, run after run.',
    visual: (
      <div className="space-y-1.5">
        {[
          { engine: 'ChatGPT', named: true },
          { engine: 'Perplexity', named: false },
        ].map((r) => (
          <div key={r.engine} className="flex items-center gap-2 text-[11.5px]">
            <span className="text-[#a8a29e] w-20 shrink-0 text-left">{r.engine}</span>
            {r.named ? (
              <span className="chip bg-[#34d399]/[0.12] text-[#34d399]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                Named you
              </span>
            ) : (
              <span className="chip bg-white/[0.06] text-[#a8a29e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#57534e]" />
                Named 5 others
              </span>
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Competitor Share of Voice',
    body: 'See which competitors get recommended most often, and on which questions you are missing entirely.',
    visual: (
      <div className="space-y-1.5">
        {[
          { label: 'Competitor A', w: 'w-4/5' },
          { label: 'Competitor B', w: 'w-3/5' },
          { label: 'You', w: 'w-1/12' },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-2">
            <span className="text-[10.5px] text-[#a8a29e] w-24 shrink-0 truncate text-left">{r.label}</span>
            <span className="h-1.5 flex-1 rounded-full bg-[#292524] overflow-hidden">
              <span className={`block h-full ${r.w} rounded-full bg-gradient-to-r from-[#ff7448] to-[#ff4500]`} />
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Gaps Linked to Threads',
    body: 'Every question you lose comes with the Reddit conversations shaping that answer, so you know where to show up.',
    visual: (
      <div className="flex items-center gap-2 rounded-lg bg-[#292524] px-3 py-2 text-[11.5px] text-[#d6d3d1]">
        <span className="chip bg-white/[0.07] text-[#d6d3d1]">Not named</span>
        <ArrowRight className="h-3.5 w-3.5 text-[#78716c] shrink-0" />
        <span className="chip bg-[#ff4500]/[0.12] text-[#ff4500]">r/SaaS</span>
        <span className="text-[#a8a29e] text-[10.5px] hidden sm:inline">3 threads</span>
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
            <span className="text-[10.5px] text-[#a8a29e] w-24 shrink-0 truncate text-left">{r.label}</span>
            <span className="h-1.5 flex-1 rounded-full bg-[#292524] overflow-hidden">
              <span className={`block h-full ${r.w} rounded-full bg-gradient-to-r from-[#ff7448] to-[#ff4500]`} />
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

  // The URL funnel: stash the URL, then send them straight into /explore, where
  // they watch us analyse their own site before anyone mentions money.
  // pending_analyze_url is still written here on purpose: after they sign up,
  // app/projects/page.tsx reads it and opens the create-project dialog, and
  // that path has to keep working exactly as it does today.
  const handleHeroAnalyze = () => {
    const raw = heroUrl.trim();
    if (!raw) {
      router.push(user ? '/projects' : '/login');
      return;
    }
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    // Safari private mode and blocked-storage settings throw on setItem. An
    // unhandled throw here would abort the handler before the router.push and
    // the only CTA on the landing page would silently do nothing. The URL also
    // travels in the query string, and ReadyPanel backfills this key from
    // session.url at the hand off, so losing the write costs us nothing.
    try {
      sessionStorage.setItem('pending_analyze_url', normalized);
    } catch {
      /* storage unavailable, the funnel still works */
    }
    router.push(`/explore?url=${encodeURIComponent(normalized)}`);
  };

  return (
    <main className="min-h-screen bg-[#0c0a09]">
      {/* ───── NAVIGATION ───── */}
      {/* Full-width bar: logo anchored left, links centred, CTA anchored right.
          Same translucent-canvas-over-blur treatment as the /explore header. */}
      <header className="sticky top-0 z-50 bg-[#0c0a09]/[0.92] backdrop-blur-md border-b border-white/[0.08]">
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
              <span className="font-bold text-xl text-[#fafaf9] tracking-tight">SneakyGuy</span>
            </Link>

            <nav
              className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
              aria-label="Main"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13.5px] text-[#a8a29e] hover:text-[#fafaf9] font-medium transition-colors"
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
                className="md:hidden p-2 -mr-2 text-[#a8a29e]"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="md:hidden border-t border-white/[0.08] py-3 flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-[#a8a29e] hover:text-[#fafaf9] font-medium"
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
      <section className="relative bg-[#0c0a09] overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-10 text-center">
          <h1 className="text-[40px] sm:text-[60px] font-bold tracking-[-0.03em] text-[#fafaf9] leading-[1.08] mb-6">
            Get recommended where your{' '}
            <em className="font-display font-medium italic tracking-[-0.01em] text-[#ff4500] whitespace-nowrap">
              customers search
            </em>
          </h1>

          <p className="text-lg text-[#d6d3d1] mb-9 max-w-xl mx-auto leading-relaxed">
            Your buyers ask Reddit, then they ask ChatGPT. Paste your website. SneakyGuy
            finds the threads worth joining, drafts the reply in your voice, and tracks
            whether AI assistants start naming you.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleHeroAnalyze();
            }}
            className="max-w-xl mx-auto"
          >
            {/* The single most important control on the site. On dark it has to
                announce itself as typeable, so the field is a raised surface
                inside the panel and the focus state is a brand-orange ring on
                the whole assembly rather than an all-but-invisible shadow. */}
            <div className="flex flex-col sm:flex-row gap-2.5 p-2 bg-[#1c1917] rounded-2xl border border-white/[0.08] transition-[border-color,box-shadow] duration-200 focus-within:border-[#ff4500]/70 focus-within:shadow-[0_0_0_3px_rgba(255,69,0,0.22)]">
              <div className="relative flex-1 rounded-xl bg-[#292524] border border-white/[0.06]">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716c]" aria-hidden="true" />
                <input
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  placeholder="yourwebsite.com"
                  inputMode="url"
                  autoComplete="url"
                  aria-label="Your website URL"
                  className="w-full h-12 pl-10 pr-10 rounded-xl text-[15px] text-[#fafaf9] placeholder:text-[#78716c] focus:outline-none bg-transparent"
                />
                <kbd
                  className="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#78716c] border border-white/[0.12] rounded-md px-1.5 py-0.5"
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

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[#a8a29e] justify-center">
            <span className="flex items-center">
              <Check className="h-4 w-4 text-[#34d399] mr-1.5 shrink-0" aria-hidden="true" />
              Free keyword &amp; community analysis
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-[#34d399] mr-1.5 shrink-0" aria-hidden="true" />
              AI-scored buying intent
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-[#34d399] mr-1.5 shrink-0" aria-hidden="true" />
              AI visibility tracking
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-[#34d399] mr-1.5 shrink-0" aria-hidden="true" />
              No subscription
            </span>
          </div>
        </div>

        {/* Question drift — the threads this product exists for. Edge-faded,
            slow, pauses on hover. Decorative for screen readers. The fades run
            to the canvas colour, not to white. */}
        <div className="relative mt-10 mb-2 marquee-paused" aria-hidden="true">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.12em] text-[#78716c] mb-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4500] opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ff4500]" />
              </span>
              Asked on Reddit every hour
            </span>
          </p>
          <div className="space-y-3">
            <QuestionMarqueeRow items={HERO_QUESTIONS.slice(0, 8)} />
            <QuestionMarqueeRow items={HERO_QUESTIONS.slice(8)} reverse />
          </div>
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0c0a09] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0c0a09] to-transparent" />
        </div>

        {/* Product preview — a live-styled mock of the actual dashboard, so it
            never goes stale the way the old demo video did. The segment picker
            personalizes it: belief is specific to what the visitor sells. */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-24">
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
            <span className="text-[12.5px] text-[#a8a29e] mr-1.5">Show me this for</span>
            {SEGMENTS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSegment(s)}
                aria-pressed={segment.key === s.key}
                className={`px-3.5 h-8 rounded-full text-[12.5px] font-semibold transition-colors duration-200 border ${
                  segment.key === s.key
                    ? 'bg-[#fafaf9] text-[#0c0a09] border-transparent'
                    : 'bg-[#1c1917] text-[#a8a29e] border-white/[0.08] hover:text-[#fafaf9] hover:border-white/[0.16]'
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
            className="rounded-2xl bg-[#1c1917] border border-white/[0.08] overflow-hidden text-left"
          >
            {/* window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.08] bg-[#292524]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f4bf4f]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#e8927c]/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#9ec97f]/60" />
              <span className="ml-3 text-[11px] text-[#78716c] font-medium truncate">sneakyguy.com / ai visibility</span>
            </div>

            <div className="p-4 sm:p-6 bg-[#1c1917]">
              {/* The headline the product actually produces. Leading with the
                  lead list sold the old positioning: this is the number that
                  makes someone paste their URL. */}
              <div className="mb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#78716c] mb-1.5">
                  We asked four assistants
                </p>
                <p className="text-[13px] text-[#d6d3d1] mb-3">
                  &ldquo;{segment.askedQ}&rdquo;
                </p>
                <p className="text-[15px] text-[#a8a29e]">
                  Your product was named in{' '}
                  <span className="font-bold text-[#fafaf9] tabular-nums">0 of 12</span> answers.
                </p>
              </div>

              <motion.div
                key={segment.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-2.5"
              >
                {[
                  { engine: 'ChatGPT', names: segment.chatgptNames },
                  { engine: 'Perplexity', names: segment.perplexityNames },
                ].map((row) => (
                  <div key={row.engine} className="bg-[#292524] rounded-xl border border-white/[0.06] p-3.5">
                    <p className="text-[11px] font-semibold text-[#fafaf9] mb-2">{row.engine} recommended</p>
                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                      {row.names.map((n: string) => (
                        <span key={n} className="chip bg-white/[0.07] text-[#d6d3d1]">{n}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-dashed border-white/[0.08]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#78716c]" />
                      <span className="text-[11.5px] text-[#78716c]">Your product, not mentioned</span>
                    </div>
                  </div>
                ))}

                {/* The action. Measurement alone is a dashboard, this is why it is buyable. */}
                <div className="rounded-xl border border-[#ff4500]/25 bg-[#ff4500]/[0.06] p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#ff4500] mb-2">
                    Close the gap
                  </p>
                  <div className="space-y-1.5">
                    <p className="text-[12.5px] text-[#d6d3d1]">
                      <span className="text-[#ff4500]">{segment.hotSub}</span>{' '}
                      {segment.hotQ}
                    </p>
                    <p className="text-[12.5px] text-[#a8a29e] opacity-70">
                      <span className="text-[#ff4500]/70">{segment.sub2}</span>{' '}
                      {segment.q2}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── SOCIAL PROOF ───── */}
      <SocialProof />

      {/* ───── AI VISIBILITY ───── */}
      {/* The hook, not a feature list: two real answer cards with our own
          name missing. Nobody argues with a screenshot of being left out. */}
      <section className="py-24 bg-[#0c0a09]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff4500] mb-3">AI visibility</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-[#fafaf9] leading-tight">
              Ask an AI what solves your problem.{' '}
              <em className="font-display font-medium italic text-[#ff4500]">Then count the names.</em>
            </h2>
            <p className="mt-4 text-base text-[#d6d3d1] max-w-2xl mx-auto leading-relaxed">
              Buyers ask for a shortlist before they ever reach your site, and the answer comes
              back as product names. We asked the question our own customers ask, on the day we
              built this check. Here is exactly what came back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {AI_ANSWERS.map((answer, i) => (
              <motion.div
                key={answer.engine}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl bg-[#1c1917] border border-white/[0.08] overflow-hidden text-left"
              >
                <div className={`flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.08] ${answer.headerClass}`}>
                  <span className={`h-2 w-2 rounded-full ${answer.dotClass}`} aria-hidden="true" />
                  <span className="text-[12.5px] font-semibold text-[#fafaf9]">{answer.engine}</span>
                  <span className="ml-auto chip bg-white/[0.07] text-[#a8a29e]">web search on</span>
                </div>

                <div className="p-4 sm:p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#78716c] mb-1.5">Asked</p>
                  <p className="text-[13.5px] font-semibold text-[#fafaf9] mb-4">{AI_PROMPT}</p>

                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#78716c] mb-2">Named</p>
                  <ol className="space-y-1.5 mb-4">
                    {answer.named.map((brand, n) => (
                      <li key={brand} className="flex items-center gap-2.5 text-[13px] text-[#d6d3d1]">
                        <span
                          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#292524] text-[10.5px] font-bold text-[#a8a29e] tabular-nums"
                          aria-hidden="true"
                        >
                          {n + 1}
                        </span>
                        {brand}
                      </li>
                    ))}
                  </ol>

                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/[0.14] bg-[#0c0a09] px-3 py-2.5">
                    <X className="h-3.5 w-3.5 text-[#78716c] shrink-0" aria-hidden="true" />
                    <span className="text-[12.5px] text-[#a8a29e]">
                      Your product: <span className="font-semibold text-[#d6d3d1]">not mentioned</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 rounded-2xl bg-[#1c1917] border border-white/[0.08] p-6 sm:p-8 text-left"
          >
            <h3 className="text-xl sm:text-2xl font-bold tracking-[-0.02em] text-[#fafaf9] mb-3">
              Ten product names. Yours was{' '}
              <em className="font-display font-medium italic text-[#ff4500]">not one of them.</em>
            </h3>
            <p className="text-[15px] text-[#d6d3d1] leading-relaxed mb-3">
              If the answer does not say your name, it is saying a competitor&apos;s. Your category has
              a list like this too, and someone is already on it. SneakyGuy runs your buying questions
              past the assistants and records who gets named, so you can watch that list change.
            </p>
            <p className="text-[15px] text-[#d6d3d1] leading-relaxed">
              Those answers are not random. They lean on Reddit, on comparison threads and on the
              &quot;what do you actually use&quot; posts written by people who tried everything. That is the
              same surface SneakyGuy already watches. Join the conversations, then watch the
              assistants catch up.
            </p>

            <div className="mt-6 pt-5 border-t border-white/[0.08] flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-[#78716c]">We check</span>
              <div className="flex flex-wrap gap-1.5">
                {AI_ENGINES.map((engine) => (
                  <span key={engine} className="chip bg-[#292524] text-[#d6d3d1]">{engine}</span>
                ))}
              </div>
              <p className="text-[12px] text-[#a8a29e] sm:ml-auto">
                We query the models with web search on, the way a buyer would ask.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section id="how-it-works" className="py-24 bg-[#0c0a09] scroll-mt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff4500] mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-[#fafaf9]">
              Find the conversation, join it,{' '}
              <em className="font-display font-medium italic text-[#ff4500]">then get named</em>
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
                className="relative bg-[#1c1917] rounded-2xl border border-white/[0.08] p-6 text-left"
              >
                <span
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ff4500]/[0.14] text-[#ff4500] text-[12px] font-bold tabular-nums mb-4"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <h3 className="text-[16px] font-semibold text-[#fafaf9] mb-1.5">{step.title}</h3>
                <p className="text-[14px] text-[#d6d3d1] leading-relaxed">{step.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="py-24 bg-[#0c0a09] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff4500] mb-3">The toolkit</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-[#fafaf9]">
              Show up in the thread,{' '}
              <em className="font-display font-medium italic text-[#ff4500]">and in the answer</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ title, body, visual }) => (
              <div
                key={title}
                className="bg-[#1c1917] rounded-2xl border border-white/[0.08] hover:border-white/[0.16] transition-colors duration-300 p-6"
              >
                <div className="mb-4 min-h-[52px] flex items-center" aria-hidden="true">
                  <div className="w-full">{visual}</div>
                </div>
                <h3 className="text-[15px] font-semibold text-[#fafaf9] mb-1.5">{title}</h3>
                <p className="text-sm text-[#d6d3d1] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PRICING ───── */}
      <section id="pricing" className="py-20 bg-[#0c0a09] scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff4500] mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.025em] text-[#fafaf9]">
              One plan.{' '}
              <em className="font-display font-medium italic text-[#ff4500]">No subscription.</em>
            </h2>
            <p className="mt-3 text-base text-[#d6d3d1] max-w-2xl mx-auto">
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
      {/* The page's one moment of drama. On a light page this was a deep ink
          panel; on the dark canvas the drama has to come from the raised panel
          plus the orange bloom, so the glow is a little stronger and the panel
          carries the same border as every other card. */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto overflow-hidden rounded-3xl bg-[#1c1917] border border-white/[0.08] px-6 py-14 sm:px-14 sm:py-16 text-center"
        >
          <div
            className="pointer-events-none absolute inset-x-0 -top-24 h-56 bg-[radial-gradient(ellipse_at_top,rgba(255,69,0,0.22),transparent_65%)]"
            aria-hidden="true"
          />
          <h2 className="relative text-3xl sm:text-[40px] font-bold tracking-[-0.025em] text-[#fafaf9] leading-tight mb-3">
            Someone is asking about your category{' '}
            <em className="font-display font-medium italic text-[#ff4500]">right now</em>
          </h2>
          {/* Closing pitch, so it gets body colour like the hero subhead and the
              AI-visibility summary, not the secondary-label tone. */}
          <p className="relative text-[15px] text-[#d6d3d1] mb-8 max-w-md mx-auto leading-relaxed">
            Paste your website. See the threads you have been missing, and who the
            assistants are naming instead of you.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleHeroAnalyze();
            }}
            className="relative max-w-lg mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-2 p-1.5 bg-[#292524] rounded-2xl border border-white/[0.08] transition-[border-color,box-shadow] duration-200 focus-within:border-[#ff4500]/70 focus-within:shadow-[0_0_0_3px_rgba(255,69,0,0.22)]">
              <input
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                placeholder="yourwebsite.com"
                inputMode="url"
                aria-label="Your website URL"
                className="flex-1 h-12 px-4 rounded-xl text-[15px] text-[#fafaf9] placeholder:text-[#78716c] focus:outline-none bg-transparent"
              />
              <button type="submit" className="btn-primary h-12 px-6 text-[15px] shrink-0">
                Find my leads
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
          {/* Risk reversal, not a footnote. #78716c lands at 3.6:1 on this
              panel, so the guarantee would be the dimmest thing in the section
              a buyer actually needs to read. Muted is the floor here. */}
          <p className="relative text-[11.5px] text-[#a8a29e] mt-4">
            Free analysis · No subscription · 7-day money-back guarantee
          </p>
        </motion.div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-white/[0.08] bg-[#0c0a09]">
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
              <span className="font-bold text-[#fafaf9]">SneakyGuy</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#a8a29e]">
              <Link href="/blog" className="hover:text-[#fafaf9] transition-colors">Blog</Link>
              <Link href="/about" className="hover:text-[#fafaf9] transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-[#fafaf9] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#fafaf9] transition-colors">Terms</Link>
            </nav>

            <p className="text-sm text-[#78716c]">
              © {new Date().getFullYear()} SneakyGuy
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
