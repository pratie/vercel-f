'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Link2, Loader2 } from 'lucide-react';
import { BTN_PRIMARY, FIELD } from '@/components/ui/sticker';

const LINK_TEXT = 'rounded text-[12.5px] font-semibold text-ink-600 underline decoration-ink-300 underline-offset-2 hover:text-ink-900 hover:decoration-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40';

function looksLikeRedditLink(text: string) {
  return /(^|\/\/|\.)(reddit\.com|redd\.it)\//i.test(text.trim()) || /^(www\.|old\.)?reddit\.com/i.test(text.trim());
}

/**
 * "Paste the link to your comment": one field, paste and done. Pasting a
 * Reddit link saves it straight away; Enter or Save link does the same. The
 * link is optional, so Skip still marks the lead replied.
 */
export function CommentLinkPrompt({
  onSave, onSkip, onCancel, skipLabel = 'Skip, add it later', autoFocus = true, compact = false,
}: {
  /** Rejects with an Error whose message is shown under the field. */
  onSave: (url: string) => Promise<void>;
  onSkip?: () => void;
  onCancel?: () => void;
  skipLabel?: string;
  autoFocus?: boolean;
  /** Results rows: no heading, field and button only. */
  compact?: boolean;
}) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  const save = async (url: string) => {
    const trimmed = url.trim();
    if (saving) return;
    if (!trimmed) {
      setError('Paste the link first, or skip.');
      inputRef.current?.focus();
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : 'Could not save that link. Check it and try again.');
      setSaving(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className={compact ? '' : 'rounded-xl border-2 border-[#1c1917]/[0.12] bg-[#fcfbf9] p-3.5'}>
      {!compact && (
        <label htmlFor={id} className="flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-900">
          <Link2 className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
          Paste the link to your comment
        </label>
      )}
      <form
        noValidate
        className={`flex flex-col gap-2 sm:flex-row ${compact ? '' : 'mt-2'}`}
        onSubmit={(e) => { e.preventDefault(); save(value); }}
      >
        <input
          ref={inputRef}
          id={id}
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={value}
          disabled={saving}
          onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}
          onPaste={(e) => {
            const text = e.clipboardData.getData('text');
            if (looksLikeRedditLink(text)) {
              e.preventDefault();
              setValue(text.trim());
              save(text);
            }
          }}
          onKeyDown={(e) => { if (e.key === 'Escape' && onCancel) { e.preventDefault(); onCancel(); } }}
          placeholder="https://www.reddit.com/r/.../comments/..."
          aria-label={compact ? 'Link to your comment' : undefined}
          aria-invalid={!!error}
          aria-describedby={`${id}-help`}
          className={`${FIELD} min-w-0 flex-1 bg-white ${error ? 'border-rose-400' : ''}`}
        />
        <button type="submit" disabled={saving} className={BTN_PRIMARY}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Saving</> : 'Save link'}
        </button>
      </form>
      <p id={`${id}-help`} className={`mt-2 text-[12.5px] leading-[1.55] ${error ? 'font-medium text-rose-700' : 'text-ink-400'}`} role={error ? 'alert' : undefined}>
        {error ?? 'Optional. Under your comment on Reddit, tap Share, then Copy link. We then check its upvotes and whether it stays up.'}
      </p>
      {(onSkip || onCancel) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {onSkip && <button type="button" onClick={onSkip} disabled={saving} className={LINK_TEXT}>{skipLabel}</button>}
          {onCancel && <button type="button" onClick={onCancel} disabled={saving} className={LINK_TEXT}>Not posted yet</button>}
        </div>
      )}
    </div>
  );
}
