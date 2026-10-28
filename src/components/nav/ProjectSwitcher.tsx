'use client';

import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, FolderKanban, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/api';
import { FOCUS_RING, projectChip, projectInitial } from './navModel';

/**
 * The project list, shared by the desktop popover and the mobile sheet.
 * Scales to a dozen projects: a filter box appears past six.
 */
export function ProjectList({
  projects, currentId, onPick, autoFocus = false,
}: {
  projects: Project[];
  currentId?: string;
  onPick?: () => void;
  autoFocus?: boolean;
}) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const firstRef = useRef<HTMLAnchorElement>(null);
  const showFilter = projects.length > 6;
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? projects.filter((p) => p.name.toLowerCase().includes(needle)) : projects;
  }, [projects, q]);

  useEffect(() => {
    if (!autoFocus) return;
    (showFilter ? inputRef.current : firstRef.current)?.focus();
  }, [autoFocus, showFilter]);

  return (
    <div className="flex min-h-0 flex-col">
      {showFilter && (
        <div className="px-2 pb-2">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter projects"
            aria-label="Filter projects"
            className="h-9 w-full rounded-lg border-2 border-[#1c1917]/[0.12] bg-white px-2.5 text-[13px] text-ink-900 placeholder:text-ink-400 focus:border-[#1c1917] focus:outline-none"
          />
        </div>
      )}
      <ul className="min-h-0 max-h-[40vh] overflow-y-auto px-1" role="list">
        {list.length === 0 && (
          <li className="px-2 py-2 text-[13px] text-ink-400">No project matches.</li>
        )}
        {list.map((p, i) => {
          const current = String(p.id) === currentId;
          return (
            <li key={p.id}>
              <Link
                ref={i === 0 ? firstRef : undefined}
                href={`/mentions/${p.id}/overview`}
                onClick={onPick}
                aria-current={current ? 'true' : undefined}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] transition-colors hover:bg-black/[0.04]',
                  current ? 'font-bold text-ink-900' : 'font-medium text-ink-700',
                  FOCUS_RING
                )}
              >
                <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-play text-[12px] font-extrabold text-white', projectChip(p.name))}>
                  {projectInitial(p.name)}
                </span>
                <span className="min-w-0 flex-1 truncate">{p.name}</span>
                {current && <Check className="h-3.5 w-3.5 shrink-0 text-[#047857]" aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-1 border-t-2 border-[#1c1917]/[0.08] px-1 pt-1">
        <Link
          href="/projects/new"
          onClick={onPick}
          className={cn('flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] font-semibold text-ink-900 transition-colors hover:bg-black/[0.04]', FOCUS_RING)}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-ink-300 text-ink-600">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          New project
        </Link>
        <Link
          href="/projects"
          onClick={onPick}
          className={cn('flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] font-medium text-ink-600 transition-colors hover:bg-black/[0.04] hover:text-ink-900', FOCUS_RING)}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center text-ink-400">
            <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          All projects
        </Link>
      </div>
    </div>
  );
}

/**
 * Desktop project switcher: a sticker button that opens a popover list.
 * In the collapsed rail it shrinks to the project chip and the popover opens
 * to the right.
 */
export function ProjectSwitcher({
  projects, current, collapsed,
}: {
  projects: Project[];
  current?: Project;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
    };
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [open]);

  const name = current?.name ?? 'Choose a project';
  const chip = current ? projectChip(current.name) : 'bg-ink-300';

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        aria-label={collapsed ? `Project: ${name}. Switch project` : undefined}
        title={collapsed ? name : undefined}
        className={cn(
          'flex w-full items-center rounded-xl border-2 border-[#1c1917] bg-white text-left shadow-[3px_3px_0_#1c1917]',
          'transition-[transform,box-shadow] duration-150 motion-reduce:transition-none',
          'hover:-translate-x-px hover:-translate-y-px hover:shadow-[4px_4px_0_#1c1917]',
          'active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0_#1c1917]',
          collapsed ? 'h-11 w-11 justify-center' : 'h-12 gap-2.5 px-2.5',
          FOCUS_RING
        )}
      >
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-play text-[14px] font-extrabold text-white', chip)}>
          {current ? projectInitial(current.name) : '?'}
        </span>
        {!collapsed && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-semibold leading-none text-ink-400">Project</span>
              <span className="mt-0.5 block truncate text-[13.5px] font-bold leading-tight text-ink-900">{name}</span>
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
          </>
        )}
      </button>

      {open && (
        <div
          id={id}
          role="dialog"
          aria-label="Switch project"
          className={cn(
            'absolute z-30 rounded-xl border-2 border-[#1c1917] bg-white p-1.5 shadow-[6px_6px_0_#1c1917]',
            collapsed ? 'left-full top-0 ml-3 w-[248px]' : 'left-0 right-0 top-full mt-2'
          )}
        >
          <ProjectList projects={projects} currentId={current?.id} onPick={() => setOpen(false)} autoFocus />
        </div>
      )}
    </div>
  );
}
