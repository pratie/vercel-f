'use client';

import { Sidebar } from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isLandingPage = pathname === '/';
  const isPublicPage =
    isAuthPage ||
    isLandingPage ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/about' ||
    pathname.startsWith('/blog');

  if (isPublicPage) {
    return <>{children}</>;
  }

  // Mobile: Sidebar renders a sticky top bar in normal flow (block layout).
  // Desktop (md+): flex row with a sticky rail on the left.
  return (
    <div className="min-h-screen md:flex bg-paper">
      <Sidebar />
      <main className="flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
