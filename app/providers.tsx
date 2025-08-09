'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from '@/components/AuthContext';
import { RootLayoutContent } from '@/components/RootLayoutContent';

const theme = createTheme({
  primaryColor: 'teal',
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-right" zIndex={1000} />
      <AuthProvider>
        <RootLayoutContent>
          {children}
        </RootLayoutContent>
      </AuthProvider>
    </MantineProvider>
  );
}
