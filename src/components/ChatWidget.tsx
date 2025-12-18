'use client';

import Script from 'next/script';

export default function ChatWidget() {
  return (
    <Script
      src="https://www.chatdock.io/embed.min.js"
      id="46316941-5e6b-4222-adc4-48fc5221012c"
      data-app-origin="https://www.chatdock.io"
      data-margin="24"
      data-size="md"
      strategy="afterInteractive"
    />
  );
}
