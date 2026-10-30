import type { Metadata } from 'next';

export const SITE_URL = 'https://www.sneakyguy.com';
const OG_IMAGE = `${SITE_URL}/images/og-image-v3.png`;

/** Title, description, canonical and social cards for a public page. */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'SneakyGuy',
      type: 'website',
      locale: 'en_US',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'SneakyGuy: find leads on Reddit' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
