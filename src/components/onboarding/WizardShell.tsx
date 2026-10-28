'use client';

import { ReactNode } from 'react';

export const WIZARD_STEPS = ['Your product', 'Studying it', 'Check', 'Where to look'] as const;

interface WizardShellProps {
  /** 1-based. */
  step: number;
  title: string;
  lead?: ReactNode;
  children: ReactNode;
  /** Something small under the card, like a back link. */
  footer?: ReactNode;
}

/**
 * One job per screen: a centered column, a small step indicator, a display
 * heading, a line of lead copy and the step's content.
 */
export function WizardShell({ step, title, lead, children, footer }: WizardShellProps) {
  const total = WIZARD_STEPS.length;
  const current = Math.min(Math.max(step, 1), total);
  return (
    <div className="mx-auto w-full max-w-[560px] px-0 pb-16 pt-2 sm:pt-6">
      <div className="mb-6" aria-live="polite">
        <p className="text-[12.5px] font-medium text-ink-400">
          Step {current} of {total}
          <span className="sr-only">: {WIZARD_STEPS[current - 1]}</span>
        </p>
        <ol className="mt-2 flex gap-1.5" aria-hidden="true">
          {WIZARD_STEPS.map((label, i) => (
            <li
              key={label}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                i < current ? 'bg-[#1c1917]' : 'bg-[#1c1917]/[0.12]'
              }`}
            />
          ))}
        </ol>
      </div>

      <h1 className="font-play text-[30px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink-900 sm:text-[36px]">
        {title}
      </h1>
      {lead && <p className="mt-2.5 text-[15px] leading-relaxed text-ink-600">{lead}</p>}

      <div className="mt-6">{children}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}
