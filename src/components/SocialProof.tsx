'use client';

import React from 'react';
import { Twitter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

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

const fadeUp = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const SocialProof: React.FC = () => (
  <section className="py-16 md:py-28 bg-[#ffffff]">
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-10 md:mb-14">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
          <p className="text-[12px] font-semibold text-[#d94100] uppercase tracking-[0.15em] mb-3">Testimonials</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1c1917]">What early users said</h2>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
            transition={{ delay: i * 0.08 }}
            className="group rounded-2xl bg-[#ffffff] border border-black/[0.09] shadow-[0_1px_2px_rgba(28,25,23,0.04),0_12px_32px_-16px_rgba(28,25,23,0.14)] hover:border-black/[0.16] transition-colors duration-300 p-6 flex flex-col justify-between"
          >
            <div>
              <p className="text-sm text-[#44403c] leading-relaxed mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-black/[0.12]">
                  <Image src={t.avatar} alt={t.name} width={32} height={32} className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1c1917]">{t.name}</p>
                  <p className="text-[11px] text-[#8a827b]">{t.handle}</p>
                </div>
              </div>
              <Link
                href={t.link}
                target="_blank"
                className="w-7 h-7 rounded-md bg-[#f4f1ec] border border-black/[0.08] flex items-center justify-center text-[#78716c] hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/[0.12] transition-[color,border-color,background-color]"
              >
                <Twitter size={12} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust counter */}
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={fadeUp}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-[#ffffff] border border-black/[0.09]">
          {/* A real number from the users table (404 signups, Sep 2026). No
              star ratings or placeholder faces: nobody gave those. */}
          <span className="text-xs text-[#78716c] font-medium">
            <span className="font-bold text-[#1c1917]">400+</span> people have signed up to find leads on Reddit
          </span>
        </div>
      </motion.div>
    </div>
  </section>
);

export default SocialProof;
