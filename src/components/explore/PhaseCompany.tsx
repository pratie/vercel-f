'use client';

/**
 * Phase 0 of /explore: "we read your site and here is what you sell".
 *
 * This is the first moment the visitor sees their own business described back
 * to them, so the whole card is one centred object with nothing competing for
 * attention. It has three states, and all three are handled here:
 *   loading  a skeleton in the exact shape of the answer
 *   found    favicon, name, domain, an emerald Found pill, the description
 *   thin     company came back but the description is empty
 */

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { domainFromUrl, type OnboardingCompany } from '@/lib/onboarding';
import { SkeletonBlock, SkeletonLine } from './Skeletons';

export interface PhaseCompanyProps {
  /** The URL the visitor pasted. Used for the domain line and the favicon. */
  url: string;
  /** company off the poll response. null until phase 0 finishes. */
  company: OnboardingCompany | null;
  /**
   * Force the skeleton. Defaults to "company has not arrived yet", which is the
   * right answer during a normal run.
   */
  loading?: boolean;
  className?: string;
}

export function PhaseCompany({ url, company, loading, className }: PhaseCompanyProps) {
  const reduce = useReducedMotion();
  const domain = domainFromUrl(url);
  const isLoading = loading ?? company === null;

  return (
    <section
      className={cn(
        'mx-auto w-full max-w-xl rounded-2xl border border-black/[0.09] bg-[#ffffff] shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.14)] p-5 sm:p-6',
        className,
      )}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <CompanySkeleton />
      ) : (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-start gap-3.5">
            {/* Keyed on the domain so the failure latch below resets when the
                visitor runs a second site without a full remount. */}
            <Favicon key={domain} domain={domain} />

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[16px] font-semibold leading-tight text-[#1c1917]">
                {company?.name?.trim() || domain || 'Your site'}
              </h3>
              {domain && (
                <p className="mt-1 truncate font-mono text-[12px] text-[#8a827b]">{domain}</p>
              )}
            </div>

            <FoundPill />
          </div>

          <div className="mt-5 border-t border-black/[0.08] pt-5">
            {company?.description?.trim() ? (
              <p className="text-[14.5px] leading-relaxed text-[#44403c]">{company.description}</p>
            ) : (
              <p className="text-[14px] leading-relaxed text-[#78716c]">
                We could not pull a clear description off this page. The run keeps going on the page copy we did
                read, so the rest may be broader than usual.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Favicon                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Google's favicon service, with a globe fallback. Plenty of sites have no
 * icon, and a broken image frame in the hero card of the funnel would be the
 * first thing the visitor notices, so the swap is silent.
 */
function Favicon({ domain }: { domain: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(domain) && !failed;

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.08] bg-[#f4f1ec]">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
          alt=""
          width={24}
          height={24}
          className="h-6 w-6"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <Globe className="h-[18px] w-[18px] text-[#8a827b]" aria-hidden />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* FoundPill                                                                  */
/* -------------------------------------------------------------------------- */

function FoundPill() {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#059669]/20 bg-[#059669]/[0.09] px-2.5 py-1 text-[11px] font-medium text-[#059669]">
      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
      Found
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

function CompanySkeleton() {
  return (
    <div>
      <div className="flex items-start gap-3.5">
        <SkeletonBlock tone="raised" className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2.5 pt-1">
          <SkeletonLine tone="raised" width="w-2/5" height="h-3.5" />
          <SkeletonLine tone="raised" width="w-1/4" height="h-2.5" />
        </div>
        <SkeletonBlock tone="raised" className="h-6 w-16 rounded-full" />
      </div>

      <div className="mt-5 space-y-2.5 border-t border-black/[0.08] pt-5">
        <SkeletonLine tone="raised" width="w-full" />
        <SkeletonLine tone="raised" width="w-11/12" />
        <SkeletonLine tone="raised" width="w-3/5" />
      </div>
    </div>
  );
}
