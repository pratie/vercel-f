// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Poppins, Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Providers } from './providers';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'], 
  variable: '--font-jakarta',
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
  weight: ['400', '500', '600', '700'],
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
    <html lang="en" className={`${jakartaSans.variable} ${spaceGrotesk.variable} ${inter.variable} font-sans`}>
      <head>
        <GoogleAnalytics />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </head>
      <body className={`${jakartaSans.className} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
        <ChatWidget />
      </body>
    </html>
  );
}