/**
 * Shared display helpers for the AI Visibility surfaces.
 *
 * The backend reports engines as lowercase keys. Everything user-facing goes
 * through engineLabel() so a new or renamed engine degrades to a readable name
 * instead of leaking a raw key into the UI.
 */

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: 'ChatGPT',
  openai: 'ChatGPT',
  gpt: 'ChatGPT',
  gemini: 'Gemini',
  google: 'Gemini',
  perplexity: 'Perplexity',
  claude: 'Claude',
  anthropic: 'Claude',
};

export function engineLabel(engine: string): string {
  const key = (engine || '').trim().toLowerCase();
  if (ENGINE_LABELS[key]) return ENGINE_LABELS[key];
  if (!key) return 'Unknown';
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/** "Perplexity", "Perplexity and Claude", "ChatGPT, Perplexity and Claude". */
export function joinEngineNames(engines: string[]): string {
  const names = engines.map(engineLabel);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Muted line colours for competitor series. The brand always gets orange. */
export const COMPETITOR_COLORS = ['#8a8072', '#b3a996', '#9aa6b2', '#b0a2b8', '#a2b5a8', '#c2b39a'];

/** Brand orange, matching the re-anchored orange-500 in tailwind.config.js. */
export const BRAND_COLOR = '#ff4500';

/** Warm hairline used by the existing analytics charts. */
export const CHART_GRID = '#f0eae2';
export const CHART_TICK = { fontSize: 11, fill: '#8a8072' };

export function formatRunDate(iso: string | null): string {
  if (!iso) return '';
  // The API sends naive UTC timestamps (datetime.utcnow().isoformat()). Without
  // the marker the browser reads them as local time and prints a future date.
  const utc = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso) ? iso : `${iso}Z`;
  const date = new Date(utc);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}
