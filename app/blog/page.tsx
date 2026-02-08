import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { Metadata } from 'next';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Reddit Marketing Blog | SneakyGuy',
    description: 'Learn how to find leads on Reddit, Reddit marketing strategies, and how to use Reddit for business growth.',
};

// Calculate reading time
function calculateReadingTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min`;
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white">
            {/* Navigation */}
            <header className="sticky top-0 z-50 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="SneakyGuy Logo"
                                width={40}
                                height={40}
                                className="mr-2"
                            />
                            <span className="font-bold text-xl text-gray-900">SneakyGuy</span>
                        </Link>

                        <nav className="hidden md:flex space-x-10">
                            <Link href="/#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                Features
                            </Link>
                            <Link href="/#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                How it Works
                            </Link>
                            <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                                Pricing
                            </Link>
                            <Link href="/blog" className="text-[#FF6F20] font-medium transition-colors">
                                Blog
                            </Link>
                        </nav>

                        <Link
                            href="/login"
                            className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-full font-medium transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
                    <div className="inline-flex items-center gap-2 bg-[#FF6F20]/20 text-[#FF6F20] px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <BookOpen className="w-4 h-4" />
                        Reddit Marketing Insights
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                        The SneakyGuy Blog
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Real strategies, honest reviews, and lessons learned from building a business on Reddit. No fluff.
                    </p>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
                {/* Featured Post (First Post) */}
                {allPosts.length > 0 && (
                    <div className="mb-16">
                        <article className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                            <div className="p-8 sm:p-10">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-[#FF6F20] text-white text-xs font-semibold rounded-full uppercase">
                                        Featured
                                    </span>
                                    {allPosts[0].tags?.slice(0, 2).map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 group-hover:text-[#FF6F20] transition-colors">
                                    <Link href={`/blog/${allPosts[0].slug}`} className="after:absolute after:inset-0">
                                        {allPosts[0].title}
                                    </Link>
                                </h2>
                                <p className="text-gray-600 text-lg mb-6 line-clamp-2">
                                    {allPosts[0].excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{allPosts[0].author}</span>
                                        <span>•</span>
                                        <time>{allPosts[0].date}</time>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {calculateReadingTime(allPosts[0].content)}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-2 text-[#FF6F20] font-semibold group-hover:gap-3 transition-all">
                                        Read Article <ArrowRight className="w-4 h-4" />
                                    </span>
                                </div>
                            </div>
                        </article>
                    </div>
                )}

                {/* Rest of Posts */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {allPosts.slice(1).map((post) => (
                        <article
                            key={post.slug}
                            className="group relative bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:border-orange-100 transition-all duration-300"
                        >
                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {post.tags.slice(0, 2).map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#FF6F20] transition-colors line-clamp-2">
                                <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                                    {post.title}
                                </Link>
                            </h2>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {post.excerpt}
                            </p>

                            <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2">
                                    <time>{post.date}</time>
                                </div>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {calculateReadingTime(post.content)}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-10 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                        Stop Reading. Start Finding Leads.
                    </h2>
                    <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                        SneakyGuy monitors Reddit 24/7 and alerts you to high-intent conversations. Try it free.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 bg-[#FF6F20] hover:bg-[#FF6F20]/90 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                    >
                        Get Started Free <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
