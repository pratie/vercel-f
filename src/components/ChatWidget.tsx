'use client';

import Script from 'next/script';

export default function ChatWidget() {
  return (
    <Script
      src="https://www.bookmylead.app/embed.min.js"
      id="6db40619-2dfc-4d09-9f11-b40679880006"
      data-app-origin="https://www.bookmylead.app"
      strategy="lazyOnload"
    />
  );
}
