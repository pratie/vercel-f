'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FAQItemProps {
    question: string;
    answer: string;
    isOpen: boolean;
    onClick: () => void;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItemProps) => {
    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={onClick}
                className="w-full py-6 flex items-center justify-between text-left hover:text-[hsl(var(--primary))] transition-colors group"
            >
                <span className="text-lg font-semibold text-gray-900 group-hover:text-inherit">
                    {question}
                </span>
                <div className={`flex-shrink-0 ml-4 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[hsl(var(--primary))] border-[hsl(var(--primary))]' : ''}`}>
                    {isOpen ? (
                        <Minus className="h-4 w-4 text-white" />
                    ) : (
                        <Plus className="h-4 w-4 text-gray-500 group-hover:text-[hsl(var(--primary))]" />
                    )}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-gray-600 leading-relaxed max-w-3xl">
                            {answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "Will using SneakyGuy get my Reddit account banned?",
            answer: "No. Unlike other bots that spam subreddits, SneakyGuy is designed to help you provide genuine value. We help you find relevant conversations where your product is a legitimate solution. We recommend reviewing AI responses and posting them naturally to maintain a high-quality reputation."
        },
        {
            question: "How does the AI relevancy scoring work?",
            answer: "Our proprietary AI analyzes the context, intent, and sentiment of every post. It doesn't just look for keywords; it understands if a user is asking for a recommendation (high intent) versus just mentioning a topic in passing (low intent)."
        },
        {
            question: "Can I customize the 'vibe' of the AI responses?",
            answer: "Absolutely! You can set your brand's tone (e.g., Professional, Technical, Friendly) and update your Custom Instructions. The AI will adapt its writing style to match how you want your brand to be perceived."
        },
        {
            question: "What happens after my one-month access expires?",
            answer: "After 30 days, your monitoring will pause. You can either purchase another month of access or wait until you need it again. There are no automatic renewals or 'dark patterns'—you only pay when you want to use the tool."
        },
        {
            question: "Do you offer a refund if I'm not satisfied?",
            answer: "Yes, we offer a no-questions-asked 7-day money-back guarantee. If SneakyGuy hasn't found you high-quality leads within your first week, just email us and we'll refund your $19."
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center space-x-2 bg-gray-50 px-4 py-2 rounded-full mb-4">
                        <HelpCircle className="h-4 w-4 text-[hsl(var(--primary))]" />
                        <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">Questions?</span>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 font-heading">
                        Everything you need to know
                    </h2>
                    <p className="text-lg text-gray-600">
                        Have a different question? Reach out to us at support@sneakyguy.com
                    </p>
                </div>

                <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl p-8 shadow-sm">
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
