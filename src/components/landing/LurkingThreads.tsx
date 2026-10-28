'use client';

// Hero visual: SneakyGuy peeking over a stack of Reddit threads, pointing out
// the one that is a buyer. The threads are illustrative (the same examples as
// the question drift below), styled the way Reddit shows them.

import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, ArrowBigUp } from 'lucide-react';
import SneakyPeek from './SneakyPeek';

type Thread = { sub: string; title: string; votes: number; comments: number; age: string; lead?: boolean };

const THREADS: Thread[] = [
  { sub: 'r/SaaS', title: 'What did you use to land your first 100 users?', votes: 214, comments: 87, age: '3h' },
  { sub: 'r/smallbusiness', title: 'Best alternative to HubSpot for a tiny team? Budget is maybe $30 a month.', votes: 41, comments: 26, age: '52m', lead: true },
  { sub: 'r/marketing', title: 'Is anyone else drowning in tools this year?', votes: 9, comments: 4, age: '1h' },
];

const STICKER = 'border-2 border-[#1c1917] shadow-[5px_5px_0_#1c1917]';

export default function LurkingThreads() {
  const reduce = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[460px] pt-[110px] sm:pt-[136px]">
      {/* The guy. His bottom edge sits exactly on the card's top edge. */}
      <div className="absolute left-1/2 top-0 z-30 w-[190px] -translate-x-[86%] sm:w-[236px] sm:-translate-x-[62%]">
        <SneakyPeek />
      </div>

      {/* What he is whispering, pointed at the lead row. */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -4 }}
        animate={{ opacity: 1, scale: 1, rotate: -3 }}
        transition={{ delay: 0.85, type: 'spring', stiffness: 260, damping: 18 }}
        className={`absolute right-[-6px] top-[10px] z-20 max-w-[150px] rounded-2xl bg-[#fff] px-3.5 py-2.5 sm:right-[-34px] sm:max-w-[190px] ${STICKER}`}
        style={{ transformOrigin: '20% 100%' }}
      >
        <p className="font-play text-[13.5px] sm:text-[14.5px] font-semibold leading-snug text-[#1c1917]">
          psst. that second one wants a tool like yours.
        </p>
        <span className="absolute -bottom-[9px] left-7 h-4 w-4 rotate-45 border-b-2 border-r-2 border-[#1c1917] bg-[#fff]" />
      </motion.div>

      <div className={`relative z-10 overflow-hidden rounded-[22px] bg-[#fff] ${STICKER}`}>
        <div className="flex items-center justify-between border-b-2 border-[#1c1917] bg-[#ff4500] px-4 py-2.5">
          <span className="font-play text-[15px] font-bold text-white">New on Reddit</span>
          <span className="text-[12px] font-semibold text-white/90">scanned 4 min ago</span>
        </div>

        <ul>
          {THREADS.map((t) => (
            <li
              key={t.title}
              className={`relative border-b border-[#1c1917]/10 px-4 py-3.5 last:border-b-0 ${t.lead ? 'bg-[#fff1ea]' : ''}`}
            >
              <div className="mb-1 flex items-center gap-2 text-[12px] text-[#78716c]">
                <span className="font-semibold text-[#1c1917]">{t.sub}</span>
                <span>{t.age} ago</span>
              </div>
              <p className={`text-[14.5px] leading-snug ${t.lead ? 'font-semibold text-[#1c1917]' : 'text-[#44403c]'}`}>
                {t.title}
              </p>
              <div className="mt-2 flex items-center gap-4 text-[12px] text-[#78716c]">
                <span className="inline-flex items-center gap-1"><ArrowBigUp className="h-4 w-4" />{t.votes}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{t.comments}</span>
                {t.lead && (
                  <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#1c1917] px-2.5 py-1 text-[11.5px] font-semibold text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
                    92, asking for a recommendation
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="border-t-2 border-[#1c1917] bg-[#fff] px-4 py-3">
          <p className="text-[12px] font-semibold text-[#1c1917]">Your draft</p>
          <p className="mt-0.5 text-[13px] leading-snug text-[#44403c]">
            We had the same problem at 3 people. I built Leadly for exactly this, it&apos;s $19 a month and imports from HubSpot in a click.
          </p>
        </div>
      </div>
    </div>
  );
}
