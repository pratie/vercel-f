// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/AuthContext';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
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
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${inter.className} min-h-screen bg-gradient-to-br from-[#fff5f2] via-white to-[#f0f7ff] font-sans antialiased ${spaceGrotesk.className}`}>
        <AuthProvider>
          <Navbar />
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}