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
  PlusCircle
} from 'lucide-react';
import { useAuth } from './AuthContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { RedditStatusIndicator } from './RedditStatusIndicator';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsOpen(true);
      }
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
    {
      name: 'Projects',
      href: '/projects',
      icon: LayoutGrid
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#ff4500] text-white hover:bg-[#e03e00] transition-colors shadow-md"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <div className={cn(
        "fixed md:sticky top-0 left-0 z-40 transform transition-all duration-300 ease-in-out",
        "h-screen flex flex-col w-56 font-sans bg-gradient-to-b from-white to-[#fff8f6]",
        "border-r border-gray-100",
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Logo section */}
        <div className="p-5">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="SneakyGuy Logo"
              width={32}
              height={32}
              className="mr-2 w-8 h-8"
              priority
            />
            <span className="text-[#ff4500] font-bold text-xl">Sneakyguy</span>
          </div>
        </div>

        {/* Navigation Links - Scrollable area with hidden scrollbar */}
        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          <div className="px-1 space-y-1">
            {navigation.map((item) => {
              const isActiveRoute = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => isMobile && setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActiveRoute
                      ? "bg-[#FFF0E6] text-[#ff4500]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActiveRoute ? "text-[#ff4500]" : "text-gray-400"
                  )} />
                  {item.name}
                  {isActiveRoute && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#ff4500]" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom section */}
        <div className="shrink-0 mt-auto border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          {/* Reddit Connection Status */}
          <div className="p-3">
            <RedditStatusIndicator />
          </div>

          {/* User & Logout */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 text-gray-400" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}