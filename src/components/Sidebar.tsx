'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from './AuthContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { RedditStatusIndicator } from './RedditStatusIndicator';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path: string) => {
    if (path === '/projects' && pathname === '/projects') return true;
    if (path === '/mentions' && pathname.includes('/mentions')) return true;
    return pathname === path;
  };

  const navigation = [
    { name: 'Projects', href: '/projects', icon: LayoutGrid },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-gray-900 text-white shadow-lg"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div className={cn(
        "fixed md:sticky top-0 left-0 z-40 transform transition-all duration-200 ease-out",
        "h-screen flex flex-col w-[220px] bg-white border-r border-gray-100",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Logo */}
        <div className="px-5 h-14 flex items-center border-b border-gray-50">
          <Link href="/projects" className="flex items-center gap-2">
            <Image src="/logo.png" alt="SneakyGuy" width={24} height={24} priority />
            <span className="font-bold text-sm text-gray-900 tracking-tight">SneakyGuy</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setIsOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("h-4 w-4", active ? "text-white" : "text-gray-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto border-t border-gray-100">
          <div className="p-3">
            <RedditStatusIndicator />
          </div>
          <div className="px-3 pb-3">
            {user && (
              <div className="px-3 py-1.5 mb-2">
                <p className="text-[11px] text-gray-400 font-medium truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
