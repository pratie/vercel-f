import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';
import { ArrowRight, Clock } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Reddit Marketing Blog | SneakyGuy',
    description:
        'Learn how to find leads on Reddit, Reddit marketing strategies, and how to use Reddit for business growth.',
};

function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return `${Math.ceil(words / wordsPerMinute)} min`;
}

/** Dates in frontmatter are calendar days, so format them in UTC to stop them
 * rendering a day early for readers west of Greenwich. */
function formatDate(date: string): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

export default function BlogIndex() {
    const allPosts = getAllPosts([
        'title',
        'date',
        'slug',
        'author',
        'excerpt',
        'content',
        'tags',
    ]);

    const [featured, ...rest] = allPosts;

    return (
        <div className="min-h-screen bg-paper">
            {/* ---- Nav ---- */}
            <header className="sticky top-0 z-50 border-b border-cream/80 bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <Image
                                src="/logo.png"
                                alt=""
                                width={40}
                                height={25}
                                className="no-outline h-auto w-9"
                            />
                            <span className="text-[17px] font-bold tracking-tight text-ink-900">
                                SneakyGuy
                            </span>
                        </Link>

                        <nav className="hidden items-center gap-8 md:flex">
                            <Link
                                href="/#features"
                                className="text-[13.5px] font-semibold text-ink-600 transition-colors hover:text-ink-900"
                            >
                                Features
                            </Link>
                            <Link
                                href="/#how-it-works"
                                className="text-[13.5px] font-semibold text-ink-600 transition-colors hover:text-ink-900"
                            >
                                How it works
                            </Link>
                            <Link
                                href="/#pricing"
                                className="text-[13.5px] font-semibold text-ink-600 transition-colors hover:text-ink-900"
                            >
                                Pricing
                            </Link>
                            <Link href="/blog" className="text-[13.5px] font-bold text-orange-600">
                                Blog
                            </Link>
                        </nav>

                        <Link href="/login" className="btn-primary text-[13px]">
                            Get started
                        </Link>
                    </div>
                </div>
            </header>

            {/* ---- Masthead ---- */}
            <div className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-600">
                    The SneakyGuy Blog
                </p>
                <h1 className="max-w-3xl font-display text-[36px] font-semibold leading-[1.08] tracking-tight text-ink-900 sm:text-[52px]">
                    Everything we learned finding customers on Reddit.
                </h1>
                <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-600">
                    Real strategies, honest tool reviews, and the mistakes we made first. No growth
                    hacks, no fluff.
                </p>
            </div>

            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="h-px w-full bg-cream" />
            </div>

            {/* ---- Featured ---- */}
            {featured && (
                <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
                    <article className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-card-hover sm:p-10">
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="chip bg-orange-500 text-[10.5px] uppercase tracking-[0.1em] text-white">
                                Latest
                            </span>
                            {featured.tags?.slice(0, 2).map((tag: string) => (
                                <span key={tag} className="chip bg-cream text-[11px] text-ink-600">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h2 className="max-w-3xl font-display text-[27px] font-semibold leading-tight tracking-tight text-ink-900 transition-colors group-hover:text-orange-600 sm:text-[34px]">
                            <Link href={`/blog/${featured.slug}`} className="after:absolute after:inset-0">
                                {featured.title}
                            </Link>
                        </h2>

                        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-600">
                            {featured.excerpt}
                        </p>

                        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-ink-400">
                            <span className="font-semibold text-ink-600">{featured.author}</span>
                            <span aria-hidden="true">·</span>
                            <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {calculateReadingTime(featured.content)}
                            </span>
                            <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-bold text-orange-600">
                                Read article
                                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        </div>
                    </article>
                </div>
            )}

            {/* ---- Archive ---- */}
            {rest.length > 0 && (
                <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
                    <h2 className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-ink-400">
                        More articles
                    </h2>
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {rest.map((post) => (
                            <article
                                key={post.slug}
                                className="group relative flex flex-col rounded-2xl bg-white p-6 shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-card-hover"
                            >
                                {post.tags?.[0] && (
                                    <span className="mb-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-orange-600">
                                        {post.tags[0]}
                                    </span>
                                )}

                                <h3 className="text-[17px] font-bold leading-snug tracking-tight text-ink-900 transition-colors group-hover:text-orange-600">
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="after:absolute after:inset-0"
                                    >
                                        {post.title}
                                    </Link>
                                </h3>

                                <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-ink-400">
                                    {post.excerpt}
                                </p>

                                <div className="mt-5 flex items-center justify-between border-t border-cream pt-3.5 text-[12px] text-ink-400">
                                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {calculateReadingTime(post.content)}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {/* ---- CTA ---- */}
            <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
                <div className="rounded-2xl bg-ink-900 px-6 py-11 text-center shadow-card sm:px-12">
                    <h2 className="mx-auto max-w-lg font-display text-[26px] font-semibold leading-tight tracking-tight text-white sm:text-[32px]">
                        Stop reading. Start finding leads.
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-300">
                        SneakyGuy scans the subreddits your buyers live in, scores every conversation
                        for real buying intent, and drafts the reply. $19 for 30 days.
                    </p>
                    <Link
                        href="/login"
                        className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-[13.5px] font-bold text-white shadow-orange transition-colors hover:bg-orange-600"
                    >
                        Find my first leads
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
