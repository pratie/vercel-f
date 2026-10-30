'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { FOCUS } from './styles';

/**
 * The landing page's URL check, as a closing panel for the public pages.
 * Sends the visitor into /explore exactly like the landing form does, and
 * writes pending_analyze_url so the post-signup hand off keeps working.
 */
export function UrlCheckCta({
  source,
  title = 'Want these found for you every day?',
  body = 'SneakyGuy watches Reddit for people asking for a product like yours, scores every thread for buying intent, and drafts a reply that says you built it. You post it yourself.',
  variant = 'loud',
}: {
  source: string;
  title?: string;
  body?: string;
  /** "soft" sits under a tool's results; "loud" closes a page. */
  variant?: 'soft' | 'loud';
}) {
  const soft = variant === 'soft';
  const router = useRouter();
  const [url, setUrl] = useState('');

  const submit = () => {
    const raw = url.trim();
    if (!raw) {
      router.push('/explore');
      return;
    }
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      sessionStorage.setItem('pending_analyze_url', normalized);
    } catch {
      /* storage blocked, the URL also travels in the query string */
    }
    router.push(`/explore?url=${encodeURIComponent(normalized)}`);
  };

  return (
    <section className={soft ? 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20' : 'pb-20 sm:pb-28 pt-4 px-4 sm:px-6'}>
      <div
        className={
          soft
            ? 'rounded-2xl border-2 border-[#1c1917]/[0.12] bg-[#fff4f0] px-6 py-8 sm:px-10 sm:py-10 text-center lg:text-left lg:grid lg:grid-cols-[1fr_minmax(0,28rem)] lg:items-center lg:gap-10'
            : 'max-w-4xl mx-auto rounded-[28px] border-2 border-[#1c1917] bg-[#d13800] px-6 py-12 sm:px-14 sm:py-14 text-center shadow-[7px_7px_0_#1c1917]'
        }
      >
        <div>
          <h2
            className={
              soft
                ? 'font-play text-[26px] sm:text-[32px] font-extrabold leading-[1.05] tracking-[-0.02em] text-[#1c1917]'
                : 'font-play text-[32px] sm:text-[46px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white'
            }
          >
            {title}
          </h2>
          <p className={soft ? 'mt-3 mb-6 lg:mb-0 text-[15px] leading-relaxed text-[#44403c]' : 'mx-auto mt-4 mb-8 max-w-lg text-[16px] leading-relaxed text-white'}>{body}</p>
        </div>
        <div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className={soft ? 'w-full' : 'mx-auto max-w-lg'}
          >
            <div className="flex flex-col sm:flex-row gap-2 rounded-2xl border-2 border-[#1c1917] bg-white p-2 shadow-[5px_5px_0_#1c1917]">
              <div className="relative flex-1">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#78716c]" aria-hidden="true" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="yourwebsite.com"
                  inputMode="url"
                  autoComplete="url"
                  aria-label="Your website URL"
                  className="w-full h-12 pl-10 pr-3 rounded-xl text-[16px] text-[#1c1917] placeholder:text-[#78716c] bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500] focus-visible:ring-inset"
                />
              </div>
              <button
                type="submit"
                data-ml-goal="signup_click"
                data-ml-goal-source={source}
                className={`h-12 shrink-0 rounded-xl px-6 text-[15px] font-semibold text-white transition-[transform,background-color] duration-150 hover:-translate-y-0.5 motion-reduce:transition-none ${FOCUS} ${
                  soft ? 'bg-[#d13800] hover:bg-[#bf3400]' : 'bg-[#1c1917] hover:bg-[#3a3532]'
                }`}
              >
                Show me my leads
              </button>
            </div>
          </form>
          <p className={`mt-3 text-[13px] ${soft ? 'text-[#57534e]' : 'text-white'}`}>Free check, no signup, no card.</p>
        </div>
      </div>
    </section>
  );
}
