import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Clock, Calendar, ArrowLeft, User } from 'lucide-react';

// Custom MDX components for better styling
const components = {
    h2: (props: any) => (
        <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4 pb-2 border-b border-gray-100" {...props} />
    ),
    h3: (props: any) => (
        <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-3" {...props} />
    ),
    p: (props: any) => (
        <p className="text-gray-700 leading-relaxed mb-4" {...props} />
    ),
    ul: (props: any) => (
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700" {...props} />
    ),
    ol: (props: any) => (
        <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700" {...props} />
    ),
    li: (props: any) => (
        <li className="leading-relaxed" {...props} />
    ),
    blockquote: (props: any) => (
        <blockquote className="border-l-4 border-[#FF6F20] bg-orange-50 px-6 py-4 my-6 italic text-gray-700 rounded-r-lg" {...props} />
    ),
    strong: (props: any) => (
        <strong className="font-semibold text-gray-900" {...props} />
    ),
    a: (props: any) => (
        <a className="text-[#FF6F20] hover:underline font-medium" {...props} />
    ),
    code: (props: any) => (
        <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
    ),
    pre: (props: any) => (
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-6 text-sm" {...props} />
    ),
};

type Props = {
    params: {
        slug: string;
    };
};

// Calculate reading time
function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const post = getPostBySlug(params.slug, ['title', 'excerpt']);
        return {
            title: `${post.title} | SneakyGuy Blog`,
            description: post.excerpt,
        };
    } catch (e) {
        return {
            title: 'Blog Post Not Found',
        };
    }
}

export async function generateStaticParams() {
    const posts = getAllPosts(['slug']);
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export default async function BlogPost({ params }: Props) {
    let post;

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

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Blog
                    </Link>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {post.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1 bg-[#FF6F20]/20 text-[#FF6F20] text-xs font-medium rounded-full uppercase tracking-wide"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <p className="text-lg text-gray-300 mb-8 max-w-2xl">
                        {post.excerpt}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FF6F20] to-orange-400 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-white font-medium">{post.author}</div>
                                <div className="text-xs">Author</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <time dateTime={post.date}>{post.date}</time>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{readingTime}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 -mt-8 relative z-10">
                    <div className="prose prose-lg max-w-none">
                        <MDXRemote source={post.content} components={components} />
                    </div>
                </div>

                {/* CTA Section */}
                <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 sm:p-10 text-center shadow-xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF6F20]/20 rounded-full mb-6">
                        <svg className="w-8 h-8 text-[#FF6F20]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.194 1.006.128.832.94z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                        Ready to Find Leads on Reddit?
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                        Stop scrolling manually. Let SneakyGuy find high-intent conversations while you focus on closing deals.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center bg-[#FF6F20] hover:bg-[#FF6F20]/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg shadow-orange-500/20"
                    >
                        Start Free Trial
                    </Link>
                </div>

                {/* Back to Blog */}
                <div className="mt-8 text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#FF6F20] transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        View All Articles
                    </Link>
                </div>
            </article>
        </div>
    );
}
