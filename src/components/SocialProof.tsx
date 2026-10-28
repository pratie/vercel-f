'use client';

// Proof, in one row. Three real quotes from X and one real number from the
// users table (404 signups, Sep 2026). No star ratings, no logos, nothing
// invented. No scroll motion: the landing page spends its one motion moment
// on the hero.

import React from 'react';
import { Twitter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Andrem Flores',
    handle: '@andremflores',
    avatar: '/images/testimonials/andremflores.jpg',
    quote: 'I love the app, I see a lot of potential with it tbh',
    link: 'https://x.com/andremflores',
  },
  {
    name: 'GovBidMike',
    handle: '@GovBidMike',
    avatar: '/images/testimonials/govbidmike.jpg',
    quote: 'Find all the subreddits automatically and relevant reddit posts is very helpful. Saves a ton of time. The tool has a lot of potential.',
    link: 'https://x.com/GovBidMike',
  },
  {
    name: 'Eris Margeta',
    handle: '@eris_margeta',
    avatar: '/images/testimonials/eris_margeta.jpg',
    quote: 'I am so thankful for this. You have a killer tool',
    link: 'https://x.com/eris_margeta',
  },
];

const FOCUS =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4500]';

const SocialProof: React.FC = () => (
  <section className="py-20 sm:py-28 bg-[#ffffff]">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="font-play text-[34px] sm:text-[46px] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#1c1917]">
          400+ people have signed up.
        </h2>
        <p className="mt-3 text-[16px] text-[#44403c]">Here is what a few of them said.</p>
      </div>

      <ul className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <li
            key={t.handle}
            className="flex flex-col justify-between rounded-2xl border-2 border-[#1c1917] bg-[#ffffff] p-6 shadow-[4px_4px_0_#1c1917]"
          >
            <p className="font-play text-[17px] font-semibold leading-snug text-[#1c1917] mb-6">
              &ldquo;{t.quote}&rdquo;
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#1c1917]">
                  <Image src={t.avatar} alt="" width={32} height={32} className="object-cover no-outline" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1c1917]">{t.name}</p>
                  <p className="text-[12px] text-[#78716c]">{t.handle}</p>
                </div>
              </div>
              <Link
                href={t.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${t.name} on X`}
                className={`w-8 h-8 rounded-lg border-2 border-[#1c1917] flex items-center justify-center text-[#1c1917] hover:bg-[#1c1917] hover:text-white transition-colors ${FOCUS}`}
              >
                <Twitter size={13} />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default SocialProof;
