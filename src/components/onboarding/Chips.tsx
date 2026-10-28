'use client';

import { KeyboardEvent, ReactNode, useState } from 'react';
import { Check, Loader2, Plus, X } from 'lucide-react';

const FOCUS =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2';

/** A chip the user keeps or removes. */
export function RemovableChip({
  label,
  detail,
  onRemove,
  removeLabel,
  tone = 'default',
}: {
  label: ReactNode;
  detail?: ReactNode;
  onRemove: () => void;
  removeLabel: string;
  tone?: 'default' | 'warn';
}) {
  return (
    <span
      className={`inline-flex h-9 max-w-full items-center gap-1.5 rounded-xl border-2 pl-3 pr-1 text-[13px] font-medium ${
        tone === 'warn'
          ? 'border-dashed border-ink-300 text-ink-600'
          : 'border-[#1c1917] bg-white text-ink-900 shadow-[2px_2px_0_#1c1917]'
      }`}
    >
      <span className="truncate">{label}</span>
      {detail && <span className="shrink-0 text-[12px] font-normal tabular-nums text-ink-400">{detail}</span>}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className={`ml-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-[#f7f6f4] hover:text-ink-900 ${FOCUS}`}
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>
  );
}

/** A suggestion the user taps to confirm. Pressed state is the sticker. */
export function ToggleChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={`inline-flex h-9 max-w-full items-center gap-1.5 rounded-xl border-2 px-3 text-[13px] font-medium transition-[background-color,box-shadow,color] duration-150 motion-reduce:transition-none ${FOCUS} ${
        selected
          ? 'border-[#1c1917] bg-[#1c1917] text-white shadow-[2px_2px_0_#ff4500]'
          : 'border-[#1c1917]/[0.2] bg-white text-ink-700 hover:border-[#1c1917] hover:text-ink-900'
      }`}
    >
      {selected ? (
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <Plus className="h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}

/** A small field that adds a chip on Enter or on the button. */
export function ChipInput({
  placeholder,
  onAdd,
  busy = false,
  ariaLabel,
  prefix,
  buttonLabel = 'Add',
}: {
  placeholder: string;
  onAdd: (value: string) => void | Promise<void>;
  busy?: boolean;
  ariaLabel: string;
  prefix?: string;
  buttonLabel?: string;
}) {
  const [value, setValue] = useState('');

  const submit = async () => {
    const v = value.trim();
    if (!v || busy) return;
    await onAdd(v);
    setValue('');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex gap-2">
      <label className="relative flex-1">
        {prefix && (
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[13.5px] text-ink-400">
            {prefix}
          </span>
        )}
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={busy}
          className={`h-10 w-full rounded-xl border-2 border-[#1c1917]/[0.12] bg-white pr-3 text-[13.5px] text-ink-900 placeholder:text-ink-300 transition-colors focus:border-[#1c1917] focus:outline-none disabled:opacity-60 ${
            prefix ? 'pl-8' : 'pl-3'
          }`}
        />
      </label>
      <button
        type="button"
        onClick={submit}
        disabled={busy || !value.trim()}
        className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border-2 border-[#1c1917] bg-white px-3.5 text-[13px] font-semibold text-ink-900 shadow-[3px_3px_0_#1c1917] transition-[transform,box-shadow] duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#1c1917] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#1c1917] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none ${FOCUS}`}
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        {buttonLabel}
      </button>
    </div>
  );
}

/** 1234567 -> "1.2M", 45200 -> "45K", 900 -> "900". */
export function formatMembers(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 100_000 ? 0 : n >= 10_000 ? 0 : 1).replace(/\.0$/, '')}K`;
  return String(n);
}
