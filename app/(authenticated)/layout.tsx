'use client';

import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/components/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { PaymentGuard } from '@/components/PaymentGuard';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Check if the current page is the projects page
  const isProjectsPage = pathname === '/projects';

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <main className="flex-1 bg-gradient-to-br from-[#fff5f2] via-white to-[#f0f7ff] p-6">
        {isProjectsPage ? (
          children
        ) : (
          <PaymentGuard>{children}</PaymentGuard>
        )}
      </main>
    </div>
  );
}
