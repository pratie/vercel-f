'use client';

import Script from 'next/script';

export default function ChatWidget() {
  return (
    <Script
      src="https://www.chatdock.io/embed.min.js"
      id="2e691f89-fe75-45a3-ad1e-eec7f602a1f8"
      data-app-origin="https://www.chatdock.io"
      data-margin="24"
      data-size="md"
      strategy="afterInteractive"
    />
  );
}
