'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from '@/components/AuthContext';
import { RootLayoutContent } from '@/components/RootLayoutContent';

const theme = createTheme({
  primaryColor: 'orange',
  colors: {
    orange: [
      '#fff5f2',
      '#ffe6dc',
      '#ffc5b0',
      '#ff9e80',
      '#ff7a50',
      '#ff6433',
      '#ff4500', // Primary orange
      '#e63d00',
      '#cc3600',
      '#b33000',
    ],
  },
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
