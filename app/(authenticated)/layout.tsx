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

  const isProjectsPage = pathname === '/projects';

  return (
    <div className="flex min-h-screen w-full bg-[#fafafa]">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="min-h-full p-4 md:p-6 max-w-7xl mx-auto w-full">
          {isProjectsPage ? children : <PaymentGuard>{children}</PaymentGuard>}
        </main>
      </div>
    </div>
  );
}
