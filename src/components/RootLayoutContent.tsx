'use client';

import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { usePathname } from 'next/navigation';

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isLandingPage = pathname === '/';
  const isPublicPage = isAuthPage || isLandingPage || pathname === '/privacy' || pathname === '/terms' || pathname === '/about' || pathname.startsWith('/blog');

  if (isPublicPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-[#fafafa]">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
