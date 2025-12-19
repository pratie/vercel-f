'use client';

import { useEffect } from 'react';

export default function ChatWidget() {
  useEffect(() => {
    // Prevent duplicate injection
    if (document.getElementById('chatdock-script')) return;

    const script = document.createElement('script');
    script.src = "https://www.chatdock.io/embed.min.js";
    script.id = "chatdock-script";
    script.setAttribute('data-domain-id', '46316941-5e6b-4222-adc4-48fc5221012c');
    script.setAttribute('data-app-origin', 'https://www.chatdock.io');
    script.setAttribute('data-margin', '24');
    script.setAttribute('data-size', 'md');
    script.defer = true;

    document.body.appendChild(script);
  }, []);

  return null;
}
