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
  title: 'SneakyGuy | 24/7 Reddit Lead Machine',
  description: 'Never miss a relevant Reddit mention again. Track keywords and generate quality leads with AI-powered automation.',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'SneakyGuy | 24/7 Reddit Lead Machine',
    description: 'Track keywords and generate quality leads on Reddit automatically.',
    url: 'https://sneakyguy.io',
    siteName: 'SneakyGuy',
    images: [
      {
        url: '/images/hero_image_for_landingpage.png',
        width: 1200,
        height: 630,
        alt: 'SneakyGuy Reddit Lead Machine',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SneakyGuy | 24/7 Reddit Lead Machine',
    description: 'Get Reddit leads on autopilot while you sleep.',
    images: ['/images/hero_image_for_landingpage.png'],
    creator: '@snow_stark17',
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