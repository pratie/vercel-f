'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/button';
import { useAuth } from './AuthContext';
import Image from 'next/image';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Only show navbar on non-landing pages
  if (pathname === '/') return null;

  return (
    <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="SneakyGuy" width={26} height={26} className="no-outline" />
              <span className="text-base font-bold text-gray-900 tracking-tight">SneakyGuy</span>
            </Link>
          </div>

          <div className="flex items-center gap-1">
            {user ? (
              <>
                <Link href="/projects">
                  <Button variant="ghost" className="text-[13px] font-medium text-gray-600 hover:text-gray-900">Dashboard</Button>
                </Link>
                <Button variant="ghost" onClick={logout} className="text-[13px] font-medium text-gray-400 hover:text-gray-700">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/blog">
                  <Button variant="ghost" className="text-[13px] font-medium text-gray-600">Blog</Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="text-[13px] font-medium text-gray-600">Login</Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-semibold px-4 h-9 rounded-lg">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
