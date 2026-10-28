'use client';

import { Sidebar } from '@/components/Sidebar';
import { openProjectId } from '@/components/nav/navModel';
import { usePathname } from 'next/navigation';

export function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isLandingPage = pathname === '/';
  // /explore is the anonymous onboarding funnel. It is full bleed and dark, so
  // it must not get the warm app sidebar wrapped around it.
  const isPublicPage =
    isAuthPage ||
    isLandingPage ||
    pathname.startsWith('/explore') ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/about' ||
    pathname.startsWith('/blog');

  if (isPublicPage) {
    return <>{children}</>;
  }

  // Inside a project the mobile nav adds a fixed bottom tab bar, so the page
  // needs room underneath it.
  const inProject = !!openProjectId(pathname);

  // Mobile: Sidebar renders a sticky top bar in normal flow (block layout)
  // and, inside a project, a fixed bottom tab bar.
  // Desktop (md+): flex row with a sticky sidebar on the left.
  return (
    <div className="min-h-screen md:flex bg-paper">
      <Sidebar />
      <main className={`flex-1 min-w-0 px-4 md:px-8 py-6 md:py-8 ${inProject ? 'pb-24 md:pb-8' : ''}`}>
        {children}
      </main>
    </div>
  );
}
