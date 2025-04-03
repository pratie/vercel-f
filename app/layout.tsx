// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Poppins, Space_Grotesk } from 'next/font/google';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Providers } from './providers';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sneakyguy | Reddit Tracking & Lead Generation',
  description: 'Track Reddit keyword mentions and generate leads with AI-powered relevancy scoring',
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    google: 'f_tSBk9IVfHsqWhQ4MXGWYuBFys3IYsWQSxo9iwpb-g',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${spaceGrotesk.variable}`}>
      <head>
        <GoogleAnalytics />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </head>
      <body className={`${inter.className} font-sans antialiased ${spaceGrotesk.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}