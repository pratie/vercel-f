'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  MessageCircle,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from './AuthContext';
import Image from 'next/image';

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

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
      name: 'Mentions',
      href: '/mentions',
      icon: MessageCircle
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  return (
    <div className="h-screen flex-none bg-[#ff4500] w-64 font-inter">
      {/* Logo section with white background */}
      <div className="bg-white p-4 border-b border-[#ff4500]/10">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="SneakyGuy Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-[#ff4500] font-bold text-xl">SNEAKYGUY</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActiveRoute = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActiveRoute
                  ? 'bg-white text-[#ff4500]'
                  : 'text-white/90 hover:bg-white/10'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActiveRoute ? 'text-[#ff4500]' : 'text-white/90')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto border-t border-white/10">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}