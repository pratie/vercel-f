'use client';

import { useState } from 'react';
import { Check, Link2 } from 'lucide-react';

/** Share controls. The URL is read at click time so this works on any host
 * (localhost, a Vercel preview, production) without being told the domain. */
export function ShareRow({ title }: { title: string }) {
    const [copied, setCopied] = useState(false);

    const currentUrl = () => (typeof window === 'undefined' ? '' : window.location.href);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(currentUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard blocked (insecure origin or denied permission) */
        }
    };

    const share = (network: 'x' | 'linkedin') => {
        const url = encodeURIComponent(currentUrl());
        const href =
            network === 'x'
                ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${url}`
                : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        window.open(href, '_blank', 'noopener,noreferrer,width=600,height=540');
    };

    const iconBtn =
        'inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-600 shadow-card transition-[box-shadow,color] hover:text-ink-900 hover:shadow-card-hover';
    const textBtn =
        'inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[12px] font-semibold text-ink-600 shadow-card transition-[box-shadow,color] hover:text-ink-900 hover:shadow-card-hover';

    return (
        <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[12px] font-medium text-ink-400">Share</span>
            <button type="button" onClick={() => share('x')} className={iconBtn} title="Share on X">
                <span className="sr-only">Share on X</span>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </button>
            <button
                type="button"
                onClick={() => share('linkedin')}
                className={iconBtn}
                title="Share on LinkedIn"
            >
                <span className="sr-only">Share on LinkedIn</span>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0" />
                </svg>
            </button>
            <button type="button" onClick={copy} className={textBtn}>
                {copied ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                ) : (
                    <Link2 className="h-3 w-3" />
                )}
                {copied ? 'Copied' : 'Copy link'}
            </button>
        </div>
    );
}
