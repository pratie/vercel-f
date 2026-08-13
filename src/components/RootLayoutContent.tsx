'use client';

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

  // No Navbar here. It repeated the logo, "Dashboard" and "Logout" that the
  // sidebar already shows, so every signed-in page carried the brand twice and
  // gave two ways to sign out. Dropping it also returns 56px of vertical space.
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {/* Padding lives here now. It used to come indirectly from the Navbar,
          so content sat against the viewport edge once that was removed. */}
      <main className="flex-1 bg-[#fafafa] min-w-0 px-4 md:px-8 py-6 md:py-8">
        {children}
      </main>
    </div>
  );
}
