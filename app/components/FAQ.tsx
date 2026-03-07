'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onClick}
      className="w-full py-5 flex items-center justify-between text-left group"
    >
      <span className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors pr-4">
        {question}
      </span>
      <div className={`flex-shrink-0 w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-orange-500 border-orange-500 rotate-0' : 'bg-white border-gray-200 group-hover:border-gray-300'}`}>
        {isOpen ? (
          <Minus className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        ) : (
          <Plus className="h-3.5 w-3.5 text-gray-400" strokeWidth={2.5} />
        )}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <p className="pb-5 text-sm text-gray-500 leading-relaxed max-w-2xl">
            {answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const faqs = [
  {
    question: "Will using SneakyGuy get my Reddit account banned?",
    answer: "No. Unlike bots that spam subreddits, SneakyGuy helps you find relevant conversations where your product is a legitimate solution. We recommend reviewing AI responses and posting them naturally to maintain a high-quality reputation."
  },
  {
    question: "How does the AI relevancy scoring work?",
    answer: "Our AI analyzes the context, intent, and sentiment of every post. It doesn't just look for keywords - it understands if a user is asking for a recommendation (high intent) versus just mentioning a topic in passing (low intent)."
  },
  {
    question: "Can I customize the tone of AI responses?",
    answer: "Absolutely. You can set your brand's tone (Professional, Technical, Friendly, etc.) and update Custom Instructions. The AI adapts its writing style to match how you want your brand to be perceived."
  },
  {
    question: "What happens after my one-month access expires?",
    answer: "Your monitoring pauses. You can purchase another month whenever you need it. There are no automatic renewals or dark patterns - you only pay when you want to use the tool."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes. We offer a no-questions-asked 7-day money-back guarantee. If SneakyGuy hasn't found you high-quality leads within your first week, email us and we'll refund your $19."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-[12px] font-semibold text-orange-600 uppercase tracking-[0.15em] mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-950 mb-4">Common questions</h2>
          <p className="text-base text-gray-500">
            Can&apos;t find your answer? <a href="mailto:support@sneakyguy.com" className="text-orange-600 hover:text-orange-700 font-medium transition-colors">Contact us</a>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
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
