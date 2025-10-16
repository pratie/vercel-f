'use client';

import Script from 'next/script';

export default function ChatWidget() {
  return (
    <Script
      src="https://www.bookmylead.app/embed.min.js"
      id="7b21e6f4-28c6-48e9-a954-a67b6c0ddd8f"
      data-app-origin="https://www.bookmylead.app"
      data-margin="24"
      data-size="md"
      strategy="lazyOnload"
    />
  );
}
