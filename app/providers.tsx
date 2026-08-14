'use client';

import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthContext';
import { RootLayoutContent } from '@/components/RootLayoutContent';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthProvider>
        <RootLayoutContent>
          {children}
        </RootLayoutContent>
      </AuthProvider>
      {/* Single global toaster — pages must not mount their own. */}
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}
