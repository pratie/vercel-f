'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
  const reduce = useReducedMotion();
  return (
    <div className="border-b-2 border-[#1c1917]/10 last:border-0">
      <button
        onClick={onClick}
        aria-expanded={isOpen}
        className="w-full py-5 flex items-center justify-between text-left group rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4500]"
      >
        <span className="text-[16px] font-semibold text-[#1c1917] pr-4">{question}</span>
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 border-[#1c1917] flex items-center justify-center transition-colors duration-200 ${
            isOpen ? 'bg-[#1c1917] text-white' : 'bg-[#ffffff] text-[#1c1917] group-hover:bg-[#fff1ea]'
          }`}
          aria-hidden="true"
        >
          {isOpen ? <Minus className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[15px] text-[#44403c] leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const faqs = [
  {
    question: 'Will this work for my niche?',
    answer:
      'That is what the free check answers. Paste your website and you see the real keywords and communities for your product before paying anything. If your buyers ask questions anywhere on Reddit, SneakyGuy finds those threads. If the check looks thin for your niche, do not buy.',
  },
  {
    question: 'Will this get my Reddit account banned?',
    answer:
      'Nobody can promise that, and you should distrust anyone who does. SneakyGuy never posts for you. It finds threads where your product is a real answer and drafts a reply that says you built it. You read it, edit it, and post it yourself. Accounts get banned for spammy, undisclosed promotion, so post where it genuinely helps and follow each subreddit’s rules.',
  },
  {
    question: 'How does the scoring work?',
    answer:
      'Every matching thread gets a score from 20 to 100 and an intent label, such as asking for a recommendation, comparing tools, or complaining about a current one. Keywords only get a thread into the list. The score decides whether it is worth your time.',
  },
  {
    question: 'What are SEO opportunities?',
    answer:
      'Reddit threads that show up on Google for the searches your buyers make. People keep finding those threads for months, so a helpful reply there keeps getting read long after you post it. We list them for each project so you can reply where the traffic already is.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      'Yes. Full refund within 7 days of your first payment, no questions asked. Email us and we refund it. You can also cancel anytime from Settings.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 sm:py-28 bg-[#ffffff]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="font-play text-[34px] sm:text-[46px] font-extrabold leading-[1.02] tracking-[-0.03em] text-[#1c1917]">
            Questions
          </h2>
          <p className="mt-3 text-[16px] text-[#44403c]">
            Anything else?{' '}
            <a
              href="mailto:support@sneakyguy.com"
              className="font-semibold text-[#1c1917] underline decoration-2 decoration-[#ff4500] underline-offset-4 hover:decoration-[#1c1917] rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff4500]"
            >
              Email us
            </a>
            .
          </p>
        </div>

        <div className="rounded-2xl border-2 border-[#1c1917] bg-[#ffffff] px-6 shadow-[5px_5px_0_#1c1917]">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.question}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
