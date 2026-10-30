'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { FOCUS, logoHeight } from './styles';
import { useAuth } from '@/components/AuthContext';

const NAV_LINKS = [
  { label: 'Free tools', href: '/tools' },
  { label: 'Compare', href: '/alternatives' },
  { label: 'Pricing', href: '/#pricing' },
  { label: 'Blog', href: '/blog' },
];

/** The landing page header, for the public pages around it. */
export function MarketingHeader() {
  const pathname = usePathname() || '';
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const isCurrent = (href: string) => href !== '/#pricing' && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50 bg-white/[0.9] backdrop-blur-md border-b-2 border-[#1c1917]/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-16">
          <Link href="/" className={`flex items-center gap-2 rounded-lg ${FOCUS}`} aria-label="SneakyGuy home">
            <Image src="/logo-dark.png" alt="" width={48} height={logoHeight(48)} priority className="h-auto w-[48px] no-outline" />
            <span className="font-play font-bold text-[20px] text-[#1c1917] tracking-tight">SneakyGuy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 absolute left-1/2 -translate-x-1/2" aria-label="Main">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrent(link.href) ? 'page' : undefined}
                className={`text-[14px] font-semibold rounded transition-colors ${FOCUS} ${
                  isCurrent(link.href) ? 'text-[#1c1917] underline decoration-2 decoration-[#ff4500] underline-offset-[6px]' : 'text-[#44403c] hover:text-[#1c1917]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link
              href={user ? '/home' : '/login'}
              className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border-2 border-[#1c1917] bg-white text-[14px] font-semibold text-[#1c1917] shadow-[3px_3px_0_#1c1917] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#1c1917] motion-reduce:transition-none ${FOCUS}`}
            >
              {user ? 'Open app' : 'Sign in'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`md:hidden p-2 -mr-2 rounded-lg text-[#1c1917] ${FOCUS}`}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="md:hidden border-t-2 border-[#1c1917]/10 py-3 flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`py-2.5 text-[16px] font-semibold text-[#1c1917] rounded ${FOCUS}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
