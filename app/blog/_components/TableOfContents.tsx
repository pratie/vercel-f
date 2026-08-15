'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/blog';

/**
 * Sticky article outline with scroll spy.
 *
 * Uses scroll position rather than IntersectionObserver visibility: with long
 * sections, several headings are off-screen at once and "topmost heading above
 * the fold" is the reading position people actually expect to see highlighted.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
    const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? '');

    useEffect(() => {
        if (headings.length === 0) return;

        let frame = 0;
        const update = () => {
            frame = 0;
            // A heading counts as "current" once it passes this line.
            const line = 140;
            let current = headings[0].id;
            for (const h of headings) {
                const el = document.getElementById(h.id);
                if (el && el.getBoundingClientRect().top <= line) current = h.id;
            }
            // At the very bottom the last section wins, even if it's short.
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 80) {
                current = headings[headings.length - 1].id;
            }
            setActiveId(current);
        };

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [headings]);

    if (headings.length < 3) return null;

    return (
        <nav aria-label="On this page" className="text-[12.5px]">
            <p className="mb-3 font-semibold uppercase tracking-[0.14em] text-[10.5px] text-ink-400">
                On this page
            </p>
            <ul className="space-y-[3px] border-l border-cream">
                {headings.map((h) => {
                    const active = h.id === activeId;
                    return (
                        <li key={h.id}>
                            <a
                                href={`#${h.id}`}
                                aria-current={active ? 'location' : undefined}
                                className={[
                                    'block border-l-2 py-1 leading-snug transition-colors',
                                    h.level === 3 ? 'pl-6 text-[12px]' : 'pl-3.5',
                                    active
                                        ? 'border-orange-500 font-semibold text-ink-900'
                                        : 'border-transparent text-ink-400 hover:text-ink-700',
                                ].join(' ')}
                            >
                                {h.text}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
