'use client';

import { useEffect } from 'react';

export default function ChatWidget() {
  useEffect(() => {
    // Check if widget is already loaded
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if ((window as any).__bmlWidgetLoaded__) return;
    (window as any).__bmlWidgetLoaded__ = true;

    // Check if in iframe
    try {
      if (window.top !== window.self) return;
    } catch (e) {
      return;
    }

    const APP_ORIGIN = 'https://www.bookmylead.app';
    const DOMAIN_ID = '70857ef8-b881-456a-ad1a-f1332d885b7a';

    // Inject styles
    function injectStyles(css: string) {
      if (document.getElementById('bml-chat-styles')) return;
      const s = document.createElement('style');
      s.id = 'bml-chat-styles';
      s.textContent = css;
      document.head.appendChild(s);
    }

    injectStyles(
      '.bml-chat-frame{position:fixed;bottom:24px;right:24px;border:none;z-index:2147483647;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.2);background:#fff}@media(max-width:640px){.bml-chat-frame{bottom:16px;right:16px}}'
    );

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.className = 'bml-chat-frame';
    iframe.src = APP_ORIGIN + '/chatbot';
    iframe.title = 'BookmyLead Chatbot';
    iframe.width = '80';
    iframe.height = '80';

    let sent = false;

    // Message handler
    function onMessage(e: MessageEvent) {
      if (e.origin !== APP_ORIGIN) return;
      let data = e.data;
      try {
        if (typeof data === 'string') data = JSON.parse(data);
      } catch (_) {
        return;
      }
      if (!data || typeof data.width !== 'number' || typeof data.height !== 'number') return;
      iframe.width = String(data.width);
      iframe.height = String(data.height);
      if (!sent) {
        sent = true;
        try {
          iframe.contentWindow?.postMessage(DOMAIN_ID, APP_ORIGIN);
        } catch (_) {}
      }
    }

    window.addEventListener('message', onMessage);

    // Mount iframe
    function mount() {
      if (!document.body) {
        document.addEventListener('DOMContentLoaded', mount, { once: true });
        return;
      }
      document.body.appendChild(iframe);
    }
    mount();

    // Send domain ID after load
    iframe.onload = function () {
      setTimeout(function () {
        if (!sent) {
          sent = true;
          try {
            iframe.contentWindow?.postMessage(DOMAIN_ID, APP_ORIGIN);
          } catch (_) {}
        }
      }, 1500);
    };

    // Cleanup
    return () => {
      window.removeEventListener('message', onMessage);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      const styles = document.getElementById('bml-chat-styles');
      if (styles) {
        styles.remove();
      }
      (window as any).__bmlWidgetLoaded__ = false;
    };
  }, []);

  return null;
}
