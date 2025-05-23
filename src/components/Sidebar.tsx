'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X
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
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
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
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#ff4500] text-white"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <div className={cn(
        "fixed md:sticky top-0 left-0 z-40 transform transition-transform duration-300 ease-in-out",
        "h-screen flex flex-col bg-[#ff4500] w-56 font-inter",
        "overflow-hidden", // Prevent any overflow issues
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0",
        isMobile ? "shadow-lg" : ""
      )}>
        {/* Logo section with white background */}
        <div className="bg-white p-3 border-b border-[#ff4500]/10 shrink-0">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SneakyGuy Logo"
              width={28}
              height={28}
              className="w-7 h-7"
            />
            <span className="text-[#ff4500] font-bold text-lg">SNEAKYGUY</span>
          </div>
        </div>

        {/* Navigation Links - Scrollable area with hidden scrollbar */}
        <nav 
          className="flex-1 py-3 px-2 space-y-1 overflow-y-auto"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE and Edge */
          }}
        >
          {/* Hide scrollbar for Chrome, Safari and Opera */}
          <style jsx>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {navigation.map((item) => {
            const isActiveRoute = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setIsOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                  isActiveRoute
                    ? "bg-white text-[#ff4500]"
                    : "text-white hover:bg-white/10"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section with Reddit status and logout - Fixed at bottom */}
        <div className="shrink-0 mt-auto border-t border-white/20">
          {/* Reddit Connection Status */}
          <div className="px-2 py-2">
            <RedditStatusIndicator />
          </div>

          {/* Logout Button */}
          <div className="p-2 border-t border-white/20">
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}