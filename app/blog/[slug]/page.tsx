import { getPostBySlug, getAllPosts, extractHeadings, slugify, type Post } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { ReadingProgress } from '../_components/ReadingProgress';
import { TableOfContents } from '../_components/TableOfContents';
import { ShareRow } from '../_components/ShareRow';
import { BlogNav } from '../_components/BlogNav';

const SITE_URL = 'https://www.sneakyguy.com';

type Props = {
    params: {
        slug: string;
    };
};

function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return `${Math.ceil(words / wordsPerMinute)} min read`;
}

/** "2026-08-15" is a date, not an instant. Format it in UTC so it doesn't
 * render as the 14th for anyone west of Greenwich. */
function formatDate(date: string): string {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

function initialsOf(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('');
}

/** MDX gives headings their children as a string, an array, or nested
 * elements when the title contains bold or code. Flatten to plain text so the
 * generated anchor matches the one the table of contents computed. */
function toText(node: any): string {
    if (node == null || node === false) return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(toText).join('');
    if (node.props?.children) return toText(node.props.children);
    return '';
}

/**
 * Heading ids are assigned by mirroring `extractHeadings`: same slug, same
 * duplicate-suffix rule, applied in document order. Anchors and the sidebar
 * therefore agree without either side needing to know about the other.
 */
function createComponents() {
    const seen = new Map<string, number>();

    const headingId = (children: any) => {
        const base = slugify(toText(children));
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        return count > 0 ? `${base}-${count + 1}` : base;
    };

    const Anchor = ({ id }: { id: string }) => (
        <a
            href={`#${id}`}
            aria-label="Link to this section"
            className="absolute -left-5 top-1/2 hidden -translate-y-1/2 text-orange-300 opacity-0 transition-opacity group-hover:opacity-100 lg:block"
        >
            #
        </a>
    );

    return {
        h2: ({ children, ...props }: any) => {
            const id = headingId(children);
            return (
                <h2
                    id={id}
                    className="group relative mb-4 mt-14 scroll-mt-28 font-display text-[26px] font-semibold leading-tight tracking-tight text-ink-900 first:mt-0 sm:text-[30px]"
                    {...props}
                >
                    <Anchor id={id} />
                    {children}
                </h2>
            );
        },
        h3: ({ children, ...props }: any) => {
            const id = headingId(children);
            return (
                <h3
                    id={id}
                    className="group relative mb-3 mt-10 scroll-mt-28 text-[18px] font-bold leading-snug tracking-tight text-ink-900 sm:text-[19px]"
                    {...props}
                >
                    <Anchor id={id} />
                    {children}
                </h3>
            );
        },
        p: (props: any) => (
            <p className="mb-6 text-[18px] leading-[1.75] text-ink-700" {...props} />
        ),
        ul: (props: any) => (
            <ul className="mb-7 ml-1 list-none space-y-3 text-[18px] leading-[1.72] text-ink-700 [&>li]:relative [&>li]:pl-6 [&>li]:before:absolute [&>li]:before:left-1 [&>li]:before:top-[0.66em] [&>li]:before:h-[5px] [&>li]:before:w-[5px] [&>li]:before:rounded-full [&>li]:before:bg-orange-400" {...props} />
        ),
        ol: (props: any) => (
            <ol className="mb-7 ml-5 list-decimal space-y-3 text-[18px] leading-[1.72] text-ink-700 marker:font-semibold marker:text-ink-300" {...props} />
        ),
        li: (props: any) => <li className="leading-[1.72]" {...props} />,
        blockquote: (props: any) => (
            <blockquote
                className="my-8 rounded-r-xl border-l-[3px] border-orange-500 bg-white py-5 pl-6 pr-6 text-[17px] italic leading-relaxed text-ink-700 shadow-card [&>p:last-child]:mb-0"
                {...props}
            />
        ),
        strong: (props: any) => <strong className="font-semibold text-ink-900" {...props} />,
        em: (props: any) => <em className="italic" {...props} />,
        a: (props: any) => {
            const href: string = props.href ?? '';
            const external = /^https?:\/\//.test(href) && !href.includes('sneakyguy.com');
            return (
                <a
                    className="font-medium text-orange-600 underline decoration-orange-300 decoration-2 underline-offset-[3px] transition-colors hover:text-orange-700 hover:decoration-orange-500"
                    {...(external ? { target: '_blank', rel: 'noopener' } : {})}
                    {...props}
                />
            );
        },
        hr: () => (
            <hr className="my-10 border-0 text-center after:text-lg after:tracking-[0.6em] after:text-ink-300 after:content-['•••']" />
        ),
        code: (props: any) => (
            <code className="rounded-md bg-cream px-1.5 py-0.5 font-mono text-[14px] text-ink-900" {...props} />
        ),
        pre: (props: any) => (
            <pre className="my-6 overflow-x-auto rounded-xl bg-ink-900 p-4 font-mono text-[13.5px] leading-relaxed text-cream" {...props} />
        ),
        img: (props: any) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="my-7 w-full rounded-xl shadow-card" alt="" {...props} />
        ),
    };
}

/** Most-related posts first: shared tags win, then recency. */
function relatedPosts(current: Post, all: Post[]): Post[] {
    const currentTags = new Set(current.tags ?? []);
    return all
        .filter((p) => p.slug !== current.slug)
        .map((p) => ({
            post: p,
            shared: (p.tags ?? []).filter((t) => currentTags.has(t)).length,
        }))
        .sort((a, b) => b.shared - a.shared || (a.post.date > b.post.date ? -1 : 1))
        .slice(0, 3)
        .map((entry) => entry.post);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const post = getPostBySlug(params.slug, ['title', 'excerpt', 'date', 'author', 'tags']);
        const url = `${SITE_URL}/blog/${params.slug}`;
        return {
            title: `${post.title} | SneakyGuy Blog`,
            description: post.excerpt,
            keywords: post.tags,
            alternates: { canonical: url },
            openGraph: {
                type: 'article',
                title: post.title,
                description: post.excerpt,
                url,
                siteName: 'SneakyGuy',
                publishedTime: post.date,
                authors: [post.author],
                tags: post.tags,
            },
            twitter: {
                card: 'summary_large_image',
                title: post.title,
                description: post.excerpt,
            },
        };
    } catch (e) {
        return { title: 'Blog Post Not Found' };
    }
}

export async function generateStaticParams() {
    const posts = getAllPosts(['slug']);
    return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }: Props) {
    let post: Post;

    try {
        post = getPostBySlug(params.slug, [
            'title',
            'date',
            'slug',
            'author',
            'content',
            'excerpt',
            'tags',
        ]);
    } catch (e) {
        notFound();
    }

    const readingTime = calculateReadingTime(post.content);
    const headings = extractHeadings(post.content);
    const related = relatedPosts(post, getAllPosts(['title', 'slug', 'date', 'excerpt', 'tags']));
    const components = createComponents();

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        author: { '@type': 'Organization', name: post.author },
        publisher: { '@type': 'Organization', name: 'SneakyGuy' },
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        keywords: (post.tags ?? []).join(', '),
    };

    return (
        <div className="min-h-screen bg-paper">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ReadingProgress targetId="article-body" />
            <BlogNav />

            {/* ---- Header: full-bleed band so the article opens on something ---- */}
            <header className="border-b border-cream bg-white">
                <div className="mx-auto max-w-7xl px-5 pb-11 pt-9 sm:px-8 sm:pb-14 sm:pt-12 lg:px-12">
                    <nav className="mb-7 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-400">
                        <Link
                            href="/blog"
                            className="group inline-flex items-center gap-1.5 transition-colors hover:text-ink-900"
                        >
                            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                            Blog
                        </Link>
                    </nav>

                    {post.tags && post.tags.length > 0 && (
                        <div className="mb-5 flex flex-wrap items-center gap-2">
                            {post.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="chip bg-orange-50 text-[11px] uppercase tracking-[0.08em] text-orange-700"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <h1 className="max-w-4xl font-display text-[36px] font-semibold leading-[1.06] tracking-tight text-ink-900 sm:text-[52px] lg:text-[62px]">
                        {post.title}
                    </h1>

                    <p className="mt-6 max-w-2xl text-[19px] leading-relaxed text-ink-600 sm:text-[20px]">
                        {post.excerpt}
                    </p>

                    <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-400 text-[13px] font-bold text-white shadow-orange">
                                {initialsOf(post.author)}
                            </span>
                            <div className="leading-tight">
                                <div className="text-[14px] font-bold text-ink-900">{post.author}</div>
                                <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-400">
                                    <time dateTime={post.date}>Published {formatDate(post.date)}</time>
                                    <span aria-hidden="true">·</span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {readingTime}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="ml-auto">
                            <ShareRow title={post.title} />
                        </div>
                    </div>
                </div>
            </header>

            {/* ---- Body + sticky contents ---- */}
            <div className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-14 lg:px-12">
                <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-12 xl:gap-16">
                    {/* No card. Body copy sits straight on the page like every
                        other blog; wrapping it in a white sheet read as a document. */}
                    <article id="article-body" className="max-w-[780px]">
                        <MDXRemote source={post.content} components={components} />
                    </article>

                    {headings.length >= 3 && (
                        <aside className="hidden lg:sticky lg:top-20 lg:block">
                            <TableOfContents headings={headings} />
                        </aside>
                    )}
                </div>

                {/* ---- Conversion card. Held to the text column so the page
                     doesn't jump from a 720px measure to full bleed. ---- */}
                <section className="mt-14 max-w-[780px] overflow-hidden rounded-2xl bg-ink-900 px-6 py-10 shadow-card sm:px-12 sm:py-12">
                    <div className="mx-auto max-w-xl text-center">
                        <span className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 shadow-orange">
                            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-white" aria-hidden="true">
                                <path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286A.72.72 0 0 0 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0M6.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m8.25 4.5a5.6 5.6 0 0 1-2.75.69 5.6 5.6 0 0 1-2.75-.69.75.75 0 1 1 .75-1.3 4.1 4.1 0 0 0 2 .49 4.1 4.1 0 0 0 2-.49.75.75 0 1 1 .75 1.3M16 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                            </svg>
                        </span>
                        <h2 className="font-display text-[26px] font-semibold leading-tight tracking-tight text-white sm:text-[30px]">
                            Someone is describing your product right now
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-300">
                            SneakyGuy scans the subreddits your buyers live in, scores every match for
                            real buying intent, and drafts the reply. You post it. $19 for 30 days.
                        </p>
                        <Link
                            href="/login"
                            className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-[13.5px] font-bold text-white shadow-orange transition-colors hover:bg-orange-600"
                        >
                            Find my first leads
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                {/* ---- Keep reading ---- */}
                {related.length > 0 && (
                    <section className="mt-14 max-w-[780px]">
                        <h2 className="mb-5 font-display text-[22px] font-semibold tracking-tight text-ink-900">
                            Keep reading
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {related.map((item) => (
                                <Link
                                    key={item.slug}
                                    href={`/blog/${item.slug}`}
                                    className="group flex h-full flex-col rounded-2xl bg-white p-5 shadow-card transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-card-hover"
                                >
                                    {item.tags?.[0] && (
                                        <span className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-orange-600">
                                            {item.tags[0]}
                                        </span>
                                    )}
                                    <h3 className="text-[15px] font-bold leading-snug tracking-tight text-ink-900 transition-colors group-hover:text-orange-600">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-400">
                                        {item.excerpt}
                                    </p>
                                    <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-ink-400 transition-colors group-hover:text-orange-600">
                                        Read
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
