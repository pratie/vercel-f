// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Poppins, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthContext';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { RootLayoutContent } from '@/components/RootLayoutContent';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SneakyGuy - Reddit Tracking & Lead Generation',
  description: 'Track Reddit keyword mentions and generate leads with AI-powered relevancy scoring',
  icons: {
    icon: '/logo.png'
  }
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
      </head>
      <body className={`${inter.className} font-sans antialiased ${spaceGrotesk.className}`}>
        <AuthProvider>
          <RootLayoutContent>
            {children}
          </RootLayoutContent>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}