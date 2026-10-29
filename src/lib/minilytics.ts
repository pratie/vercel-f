// Minilytics: our self-hosted analytics. The script (loaded in app/layout.tsx)
// tracks pageviews on its own; these helpers cover the rest. Every call is a
// no-op when the script is blocked or has not loaded yet.

declare global {
  interface Window {
    minilytics?: ((cmd: 'goal' | 'identify' | 'pageview', a?: any, b?: any) => void) & {
      attribution?: () => { ml_visitor_id?: string; ml_session_id?: string };
    };
  }
}

/** The visitor and session ids Dodo needs in checkout metadata. */
export function minilyticsAttribution(): { ml_visitor_id?: string; ml_session_id?: string } {
  if (typeof window === 'undefined') return {};
  try {
    return window.minilytics?.attribution?.() ?? {};
  } catch {
    return {};
  }
}

const SIGNUP_FLAG = 'ml-signup-completed';

/**
 * Login redirects with a full page load right away, which can drop an event in
 * flight. So mark the signup here and send the goal once the next page is up.
 */
export function markSignupCompleted() {
  try { sessionStorage.setItem(SIGNUP_FLAG, '1'); } catch { /* storage blocked */ }
}

export function flushSignupCompleted() {
  try {
    if (sessionStorage.getItem(SIGNUP_FLAG) !== '1' || !window.minilytics) return;
    sessionStorage.removeItem(SIGNUP_FLAG);
    window.minilytics('goal', 'signup_completed');
  } catch { /* storage blocked */ }
}
