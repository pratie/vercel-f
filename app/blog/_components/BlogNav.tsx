import Link from 'next/link';
import Image from 'next/image';

/**
 * Shared blog header. The article page previously had no nav at all, so
 * clicking a post from the index dropped the site header entirely.
 */
export function BlogNav() {
    const link =
        'text-[13.5px] font-semibold text-ink-600 transition-colors hover:text-ink-900';

    return (
        <header className="sticky top-0 z-40 border-b border-cream/80 bg-paper/80 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
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
                    <Link href="/#features" className={link}>
                        Features
                    </Link>
                    <Link href="/#how-it-works" className={link}>
                        How it works
                    </Link>
                    <Link href="/#pricing" className={link}>
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
        </header>
    );
}
