'use client';

import { useEffect, useState } from 'react';

/**
 * Hairline progress bar pinned to the top of the article.
 * Driven by scroll position over the article element rather than the whole
 * document, so the header and footer don't count toward "read".
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const target = document.getElementById(targetId);
        if (!target) return;

        let frame = 0;
        const update = () => {
            frame = 0;
            const rect = target.getBoundingClientRect();
            const total = rect.height - window.innerHeight;
            if (total <= 0) {
                setProgress(rect.bottom <= window.innerHeight ? 1 : 0);
                return;
            }
            const scrolled = -rect.top;
            setProgress(Math.min(1, Math.max(0, scrolled / total)));
        };

        const onScroll = () => {
            // rAF-coalesced: scroll fires far more often than we can paint.
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
    }, [targetId]);

    return (
        <div
            className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent"
            aria-hidden="true"
        >
            <div
                className="h-full origin-left bg-gradient-to-r from-orange-500 to-orange-400"
                style={{ transform: `scaleX(${progress})` }}
            />
        </div>
    );
}
