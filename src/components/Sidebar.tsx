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
  ChevronsLeft,
  ChevronsRight,
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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

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

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  const isActive = (path: string) => {
    if (path === '/projects' && pathname === '/projects') return true;
    if (path === '/mentions' && pathname.includes('/mentions')) return true;
    return pathname === path;
  };

  const navigation = [
    { name: 'Projects', href: '/projects', icon: LayoutGrid },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const sidebarWidth = collapsed && !isMobile ? 'w-[64px]' : 'w-[220px]';

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-3 left-3 z-50 p-2 rounded-lg bg-orange-500 text-white shadow-lg shadow-orange-500/20"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div className={cn(
        "fixed md:sticky top-0 left-0 z-40 transform transition-[transform,width] duration-200 ease-out",
        "h-screen flex flex-col bg-white border-r border-gray-100",
        sidebarWidth,
        isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"
      )}>
        {/* Logo + Collapse toggle */}
        <div className={cn(
          "h-14 flex items-center border-b border-gray-50",
          collapsed && !isMobile ? "px-0 justify-center" : "px-5 justify-between"
        )}>
          <Link href="/projects" className="flex items-center gap-2 min-w-0">
            <Image src="/logo.png" alt="SneakyGuy" width={28} height={28} priority className="shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="font-bold text-[15px] text-gray-900 tracking-tight truncate">SneakyGuy</span>
            )}
          </Link>
          {!isMobile && !collapsed && (
            <button
              onClick={toggleCollapse}
              className="p-1 rounded-md text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {!isMobile && collapsed && (
          <div className="px-2 pt-2">
            <button
              onClick={toggleCollapse}
              className="w-full p-2 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-center"
              aria-label="Expand sidebar"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className={cn("flex-1 py-3 space-y-0.5", collapsed && !isMobile ? "px-2" : "px-3")}>
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && setIsOpen(false)}
                title={collapsed && !isMobile ? item.name : undefined}
                className={cn(
                  "flex items-center rounded-lg text-[13px] font-medium transition-[color,background-color] duration-150",
                  collapsed && !isMobile ? "justify-center p-2.5" : "gap-2.5 px-3 py-2",
                  active
                    ? "bg-orange-500 text-white shadow-[0_2px_8px_-2px_rgba(234,88,12,0.4)]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-gray-400")} />
                {(!collapsed || isMobile) && item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto border-t border-gray-100">
          {(!collapsed || isMobile) && (
            <div className="p-3">
              <RedditStatusIndicator />
            </div>
          )}
          <div className={cn(collapsed && !isMobile ? "px-2 pb-3" : "px-3 pb-3")}>
            {user && (!collapsed || isMobile) && (
              <div className="px-3 py-1.5 mb-2">
                <p className="text-[11px] text-gray-400 font-medium truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={logout}
              title={collapsed && !isMobile ? 'Sign out' : undefined}
              className={cn(
                "w-full flex items-center rounded-lg text-[13px] font-medium text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors",
                collapsed && !isMobile ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {(!collapsed || isMobile) && 'Sign out'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
