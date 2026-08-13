'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ChatWidget() {
  const pathname = usePathname();

  // Kept off the landing page. It floated over the hero, was the only thing
  // on the page not in the brand palette, and was surfacing a configuration
  // error to first-time visitors. It still loads on the signed-in app, where
  // support actually matters.
  const isLandingPage = pathname === '/';

  useEffect(() => {
    if (isLandingPage) return;

    // Prevent duplicate injection
    if (document.getElementById('chatdock-script')) return;

    const script = document.createElement('script');
    script.src = "https://www.chatdock.io/embed.min.js";
    script.id = "chatdock-script";
    script.setAttribute('data-domain-id', '2e691f89-fe75-45a3-ad1e-eec7f602a1f8');
    script.setAttribute('data-app-origin', 'https://www.chatdock.io');
    script.setAttribute('data-margin', '24');
    script.setAttribute('data-size', 'md');
    script.defer = true;

    document.body.appendChild(script);
  }, [isLandingPage]);

  return null;
}
