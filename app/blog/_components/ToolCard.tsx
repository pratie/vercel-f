import { ArrowUpRight, Check } from 'lucide-react';

type ToolCardProps = {
    /** Product name, shown as the small eyebrow label. */
    name: string;
    /** What the product does, in its own words. */
    title: string;
    summary: string;
    /**
     * Capability list. Kept factual: these should be claims the product makes
     * itself. Accepts a "|"-separated string because MDX drops array
     * expression attributes in this pipeline -- string props survive,
     * `bullets={[...]}` silently arrives undefined.
     */
    bullets?: string[] | string;
    href: string;
    cta?: string;
    /** Small print under the card, e.g. pricing or a relationship disclosure. */
    note?: string;
};

/**
 * An in-article card for a tool the post recommends.
 *
 * Deliberately rendered in SneakyGuy's own design language rather than
 * mimicking the vendor's site: it has to sit inside the article without
 * looking like a pasted-in ad. Server component, so it stays in the
 * prerendered HTML along with its outbound link.
 */
export function ToolCard({ name, title, summary, bullets, href, cta, note }: ToolCardProps) {
    const items = (typeof bullets === 'string' ? bullets.split('|') : bullets ?? [])
        .map((item) => item.trim())
        .filter(Boolean);

    return (
        <aside className="my-9 overflow-hidden rounded-2xl bg-white shadow-card">
            <div className="px-6 pb-6 pt-6 sm:px-8 sm:pb-7 sm:pt-7">
                <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-900 text-[11px] font-bold text-white">
                        {name.charAt(0)}
                    </span>
                    <span className="text-[13px] font-bold tracking-tight text-ink-900">{name}</span>
                    <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-ink-300">
                        Tool
                    </span>
                </div>

                <h3 className="font-display text-[21px] font-semibold leading-tight tracking-tight text-ink-900 sm:text-[23px]">
                    {title}
                </h3>

                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-600">{summary}</p>

                {items.length > 0 && (
                    <div className="mt-5 rounded-xl bg-cream/70 px-5 py-4">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">
                            What you control
                        </p>
                        <ul className="space-y-2">
                            {items.map((item) => (
                                <li key={item} className="flex gap-2.5 text-[14px] leading-snug text-ink-700">
                                    <Check className="mt-[3px] h-3.5 w-3.5 shrink-0 text-orange-500" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <a
                    href={href}
                    target="_blank"
                    rel="noopener"
                    className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-orange-600 no-underline transition-colors hover:text-orange-700"
                >
                    {cta || `See how ${name} does it`}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                </a>

                {note && <p className="mt-3 text-[12px] leading-relaxed text-ink-400">{note}</p>}
            </div>
        </aside>
    );
}
