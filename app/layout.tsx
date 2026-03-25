import type { Metadata } from 'next';
import { Inter, Poppins, Space_Grotesk, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Providers } from './providers';
import ChatWidget from '@/components/ChatWidget';

import Script from 'next/script';

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
  description: 'AI monitors Reddit 24/7, finds high-intent conversations about your niche, and generates authentic replies that actually convert. Get leads on autopilot while you sleep.',
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://www.sneakyguy.com'),
  openGraph: {
    title: 'SneakyGuy | 24/7 Reddit Lead Machine',
    description: 'AI monitors Reddit 24/7, finds high-intent conversations about your niche, and generates authentic replies that actually convert.',
    url: 'https://www.sneakyguy.com',
    siteName: 'SneakyGuy',
    images: [
      {
        url: 'https://www.sneakyguy.com/images/og-image.png',
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
    description: 'AI monitors Reddit 24/7, finds high-intent conversations about your niche, and generates authentic replies that convert.',
    images: ['https://www.sneakyguy.com/images/og-image.png'],
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
        <Script
          src="https://datafa.st/js/script.js"
          data-website-id="dfid_xv0o11kqaxaOnDzSQvDSn"
          data-domain="www.sneakyguy.com"
          strategy="afterInteractive"
        />
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