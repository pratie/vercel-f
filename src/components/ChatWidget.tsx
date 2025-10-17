'use client';

import Script from 'next/script';

export default function ChatWidget() {
  return (
    <Script
      src="http://localhost:3000/embed.min.js"
      id="625e2bf4-7fcb-4db7-ba68-69e2c45b101b"
      data-app-origin="http://localhost:3000"
      data-margin="24"
      data-size="md"
      strategy="lazyOnload"
    />
  );
}
