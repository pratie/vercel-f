import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import './globals.css';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Providers } from './providers';
import ChatWidget from '@/components/ChatWidget';

import Script from 'next/script';

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});

// Editorial accent for headlines only. One serif word in a sans headline is
// the difference between "template" and "brand" — use sparingly.
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SneakyGuy: Find Reddit Leads While You Sleep',
  description: 'Every Reddit lead in one place. SneakyGuy watches the subreddits your buyers post in, scores each conversation for buying intent, and drafts the reply, so you get hours back every week.',
  icons: {
    icon: '/favicon.ico',
  },
  metadataBase: new URL('https://www.sneakyguy.com'),
  openGraph: {
    title: 'SneakyGuy: Find Reddit Leads While You Sleep',
    description: 'Every Reddit lead in one place. We watch the subreddits your buyers post in, score each conversation for intent, and draft the reply. Hours back every week.',
    url: 'https://www.sneakyguy.com',
    siteName: 'SneakyGuy',
    images: [
      {
        // Bumped filename so Slack, X and LinkedIn fetch fresh art instead of
        // serving the card they already cached for this URL.
        url: 'https://www.sneakyguy.com/images/og-image-v2.png',
        width: 1200,
        height: 630,
        alt: 'SneakyGuy: find Reddit leads while you sleep',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SneakyGuy: Find Reddit Leads While You Sleep',
    description: 'Every Reddit lead in one place. We find the conversations worth replying to, and draft the reply for you.',
    images: ['https://www.sneakyguy.com/images/og-image-v2.png'],
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
    <html lang="en" className={`${jakartaSans.variable} ${fraunces.variable} font-sans`}>
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
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <ChatWidget />
      </body>
    </html>
  );
}