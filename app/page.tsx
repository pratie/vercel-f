'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SocialProof from '@/components/SocialProof';
import { PricingTable } from '@/components/PricingTable';
import { FAQ } from './components/FAQ';
import StepAnimation from '@/components/landing/StepAnimation';
import LurkingThreads from '@/components/landing/LurkingThreads';
import SneakyPeek from '@/components/landing/SneakyPeek';

// The logo is a 544x336 PNG of the guy peeking over a ledge. Keep this ratio
// wherever it renders; forcing it into a square crushes him.
// /logo-dark.png has the white ledge knocked out to transparent. It also needs
// the `no-outline` class: globals.css puts a 1px outline on every img.
const LOGO_RATIO = 336 / 544;
const logoHeight = (width: number) => Math.round(width * LOGO_RATIO);

// ---------------------------------------------------------------------------
// LAYOUT
//
// Six sections, each with one job:
//   hero        paste your URL (the only CTA on the page, repeated at the end)
//   steps       what happens next, three cards, a real sequence
//   proof       three real quotes and one real number
//   pricing     two plans, the refund, what every plan includes
//   faq         five questions
//   close       the mascot peeking over the orange panel, the URL form again
//
// One visual system: white canvas, ink text, 2px ink border with a hard
// offset shadow ("sticker"), Reddit orange for accents, #d13800 under white
// text, green for ticks. Headlines are Bricolage (font-play), body is Jakarta.
//
// One motion moment: the hero (the mascot rises, the speech bubble pops, his
// eyes follow the cursor). Nothing else fades, slides or animates on scroll.
// ---------------------------------------------------------------------------

const STICKER = 'rounded-2xl border-2 border-[#1c1917] bg-[#ffffff] shadow-[5px_5px_0_#1c1917]';
const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4500]';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '/blog' },
];

// The three beats of the product, in the order they happen. A real sequence,
// so the cards carry step numbers.
const STEPS = [
  {
    title: 'Paste your site',
    body: 'We read it, pick your keywords and subreddits, and score every new thread for buying intent, 20 to 100.',
  },
  {
    title: 'Post the reply',
    body: 'Every lead comes with a draft that says you built the product. Edit it, then post it yourself.',
  },
  {
    title: 'Reply where Google sends people',
    body: 'We find the Reddit threads that rank on Google for your keywords, so a good reply keeps getting read long after you post it.',
  },
];

function SectionHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="text-center mb-10 sm:mb-14">
      <h2 className="font-play text-[34px] sm:text-[46px] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#1c1917]">
        {title}
      </h2>
      {sub && <p className="mt-3 max-w-xl mx-auto text-[16px] sm:text-[17px] leading-relaxed text-[#44403c]">{sub}</p>}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user && pathname === '/') {
      router.push('/home');
    }
  }, [user, router, pathname]);

  const handleGetStarted = () => {
    router.push(user ? '/upgrade' : '/login');
  };

  const [heroUrl, setHeroUrl] = useState('');

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

  // The one form on the page, used twice: in the hero and in the close.
  const urlForm = (variant: 'hero' | 'close') => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleHeroAnalyze();
      }}
      className={variant === 'hero' ? 'mt-8 max-w-[34rem]' : 'mx-auto max-w-lg'}
    >
      <div
        className={`flex flex-col sm:flex-row gap-2 rounded-2xl border-2 border-[#1c1917] bg-[#ffffff] p-2 ${
          variant === 'hero'
            ? 'shadow-[5px_5px_0_#1c1917] transition-shadow focus-within:shadow-[5px_5px_0_#ff4500]'
            : 'shadow-[5px_5px_0_#1c1917]'
        }`}
      >
        <div className="relative flex-1">
          <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716c]" aria-hidden="true" />
          <input
            value={heroUrl}
            onChange={(e) => setHeroUrl(e.target.value)}
            placeholder="yourwebsite.com"
            inputMode="url"
            autoComplete="url"
            aria-label="Your website URL"
            className="w-full h-12 pl-10 pr-3 rounded-xl text-[16px] text-[#1c1917] placeholder:text-[#78716c] bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500] focus-visible:ring-inset"
          />
        </div>
        <button
          type="submit"
          className={`h-12 shrink-0 rounded-xl px-6 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 hover:-translate-y-0.5 ${FOCUS} ${
            variant === 'hero' ? 'bg-[#d13800] hover:bg-[#bf3400]' : 'bg-[#1c1917] hover:bg-[#3a3532]'
          }`}
        >
          Show me my leads
        </button>
      </div>
    </form>
  );

  return (
    <main className="min-h-screen bg-[#ffffff] text-[#1c1917]">
      {/* ───── NAV ───── */}
      <header className="sticky top-0 z-50 bg-[#ffffff]/[0.9] backdrop-blur-md border-b-2 border-[#1c1917]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex justify-between items-center h-16">
            <Link href="/" className={`flex items-center gap-2 rounded-lg ${FOCUS}`} aria-label="SneakyGuy home">
              <Image
                src="/logo-dark.png"
                alt=""
                width={48}
                height={logoHeight(48)}
                priority
                className="h-auto w-[48px] no-outline"
              />
              <span className="font-play font-bold text-[20px] text-[#1c1917] tracking-tight">SneakyGuy</span>
            </Link>

            <nav className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2" aria-label="Main">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[14px] font-semibold text-[#44403c] hover:text-[#1c1917] rounded transition-colors ${FOCUS}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleGetStarted}
                className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border-2 border-[#1c1917] bg-[#ffffff] text-[14px] font-semibold text-[#1c1917] shadow-[3px_3px_0_#1c1917] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1917] ${FOCUS}`}
              >
                Sign in
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen((open) => !open)}
                className={`md:hidden p-2 -mr-2 rounded-lg text-[#1c1917] ${FOCUS}`}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="md:hidden border-t-2 border-[#1c1917]/10 py-3 flex flex-col" aria-label="Mobile">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`py-2.5 text-[16px] font-semibold text-[#1c1917] rounded ${FOCUS}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* ───── HERO ───── */}
      {/* Left: the promise and the one action. Right: the mascot doing the job,
          lurking over a Reddit feed and pointing at the thread that is a buyer.
          This is the page's one motion moment. */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-10 items-center">
          <div>
            <h1 className="font-play text-[48px] sm:text-[76px] font-extrabold leading-[0.95] tracking-[-0.035em] text-[#1c1917]">
              Find leads while you sleep.
            </h1>

            <p className="mt-6 max-w-[34rem] text-[17px] sm:text-[19px] leading-relaxed text-[#44403c]">
              Paste your site. SneakyGuy finds the Reddit threads where people ask for a product
              like yours, and drafts a reply that says you built it. You post it yourself.
            </p>

            {urlForm('hero')}

            <p className="mt-4 text-[14px] text-[#44403c]">Free check, no signup. Takes about a minute.</p>
          </div>

          <LurkingThreads />
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section id="how-it-works" className="py-20 sm:py-28 scroll-mt-20 border-t-2 border-[#1c1917]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Three steps. About a minute." />

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className={`${STICKER} p-6 flex flex-col`}>
                {/* Drawings are authored on a 260-unit stage; capped so the
                    labels inside never grow past the card's own copy. */}
                <div className="mb-5 pb-5 border-b-2 border-[#1c1917]/10">
                  <div className="mx-auto w-full max-w-[300px]">
                    <StepAnimation index={i} still />
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span
                    className="font-play shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1c1917] bg-[#ff4500] text-[13px] font-bold text-[#1c1917] tabular-nums"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-play text-[20px] font-bold leading-tight text-[#1c1917]">{step.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-[#44403c]">{step.body}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── PROOF ───── */}
      <div className="border-t-2 border-[#1c1917]/10">
        <SocialProof />
      </div>

      {/* ───── PRICING ───── */}
      <section id="pricing" className="py-20 sm:py-28 scroll-mt-20 border-t-2 border-[#1c1917]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading title="Two plans. Cancel anytime." sub="Full refund within 7 days of your first payment." />
          <PricingTable
            onPlanSelect={() => {
              router.push(user ? '/upgrade' : '/login');
            }}
          />
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <div className="border-t-2 border-[#1c1917]/10">
        <FAQ />
      </div>

      {/* ───── CLOSE ───── */}
      {/* The mascot's second appearance: bigger, peeking over the whole closing
          panel. The panel is the ledge. */}
      <section className="pb-20 sm:pb-28 px-4 sm:px-6">
        <div className="relative max-w-4xl mx-auto pt-[122px] sm:pt-[155px]">
          <div className="absolute left-1/2 top-0 z-20 w-[300px] sm:w-[380px] -translate-x-1/2">
            <SneakyPeek delay={0.1} />
          </div>
          <div className="relative rounded-[28px] border-2 border-[#1c1917] bg-[#d13800] px-6 py-12 sm:px-14 sm:py-16 text-center shadow-[7px_7px_0_#1c1917]">
            <h2 className="font-play text-[34px] sm:text-[52px] font-extrabold leading-[1.0] tracking-[-0.03em] text-white">
              Someone is asking for you right now.
            </h2>
            <p className="mx-auto mt-4 mb-8 max-w-md text-[16px] leading-relaxed text-white">
              Paste your website. See the Reddit threads where people are asking for a product like yours.
            </p>
            {urlForm('close')}
            <p className="mt-4 text-[13px] text-white">Free check, no signup.</p>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t-2 border-[#1c1917]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Image src="/logo-dark.png" alt="" width={32} height={logoHeight(32)} className="h-auto w-8 no-outline" />
              <span className="font-play font-bold text-[#1c1917]">SneakyGuy</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[14px] font-medium text-[#44403c]" aria-label="Footer">
              {[
                ['/blog', 'Blog'],
                ['/about', 'About'],
                ['/privacy', 'Privacy'],
                ['/terms', 'Terms'],
              ].map(([href, label]) => (
                <Link key={href} href={href} className={`hover:text-[#1c1917] rounded transition-colors ${FOCUS}`}>
                  {label}
                </Link>
              ))}
            </nav>

            <p className="text-[14px] text-[#78716c]">© {new Date().getFullYear()} SneakyGuy</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
