'use client';

// Autopilot: one switch plus the drafting controls. On means scheduled scans
// plus auto-drafted replies for leads at the project's threshold (80 unless
// changed), up to a daily cap. Off means you scan by hand.

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { PaymentGuard } from '@/components/PaymentGuard';
import { QueueError, QueueHeader } from '@/components/mentions/QueueHeader';
import { api, AutopilotSettingsInput, AutopilotStatus, Project } from '@/lib/api';
import { BTN_SECONDARY, PANEL, STICKER_PANEL } from '@/components/ui/sticker';

function fmt(iso: string | null): string {
  if (!iso) return 'Not yet';
  const d = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`);
  if (isNaN(d.getTime())) return 'Not yet';
  const diffMin = Math.round((d.getTime() - Date.now()) / 60_000);
  const abs = Math.abs(diffMin);
  const rel =
    abs < 1 ? 'now'
      : abs < 60 ? `${abs} min`
        : abs < 48 * 60 ? `${Math.round(abs / 60)} h`
          : `${Math.round(abs / 1440)} d`;
  const when = d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  if (abs < 1) return `${when} (now)`;
  return `${when} (${diffMin < 0 ? `${rel} ago` : `in ${rel}`})`;
}

/** A row of choices that behaves like a radio group (arrow keys move and pick). */
function Segmented({
  label, value, options, onChange, disabled, format = (n) => String(n),
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (n: number) => void;
  disabled?: boolean;
  format?: (n: number) => string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + options.length) % options.length;
    refs.current[next]?.focus();
    onChange(options[next]);
  };
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1.5">
      {options.map((n, i) => {
        const on = n === value;
        return (
          <button
            key={n}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            disabled={disabled}
            onClick={() => !on && onChange(n)}
            onKeyDown={(e) => onKey(e, i)}
            className={`h-10 min-w-[52px] rounded-xl border-2 px-3 text-[13.5px] font-semibold tabular-nums transition-[background-color,border-color,box-shadow] duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2 disabled:opacity-50
              ${on
                ? 'border-[#1c1917] bg-[#1c1917] text-white shadow-[2px_2px_0_#ff4500]'
                : 'border-[#1c1917]/[0.12] bg-white text-ink-700 hover:border-[#1c1917]/40'}`}
          >
            {format(n)}
          </button>
        );
      })}
    </div>
  );
}

export default function AutopilotPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId as string;
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<AutopilotStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (!projectId) return;
    let cancelled = false;
    Promise.all([api.getProject(projectId), api.getAutopilot(projectId)])
      .then(([p, s]) => {
        if (cancelled) return;
        setProject(p);
        setStatus(s);
        setScanning(p.analysis_status === 'scanning');
      })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load autopilot.'); });
    return () => { cancelled = true; };
  }, [projectId, user, router]);

  const toggle = useCallback(async () => {
    if (!status || saving) return;
    const next = !status.enabled;
    setSaving(true);
    setStatus({ ...status, enabled: next });
    try {
      const updated = await api.setAutopilot(projectId, next);
      setStatus(updated);
      window.dispatchEvent(new CustomEvent('sneakyguy:autopilot-updated', { detail: { projectId, enabled: updated.enabled } }));
      toast.success(next ? 'Autopilot is on' : 'Autopilot is off. Scans are manual now');
    } catch (e) {
      setStatus(status);
      toast.error('Could not save', { description: e instanceof Error ? e.message : undefined });
    } finally {
      setSaving(false);
    }
  }, [status, saving, projectId]);

  // Each control saves on its own, optimistically, and rolls back on failure.
  const saveSetting = useCallback(async (patch: AutopilotSettingsInput, message: string) => {
    if (!status) return;
    const before = status;
    const optimistic = { ...status, ...patch };
    if (patch.min_score != null) optimistic.dm_min_score = Math.min(100, patch.min_score + 5);
    setStatus(optimistic);
    try {
      setStatus(await api.updateAutopilot(projectId, patch));
      toast.success(message, { id: 'autopilot-setting' });
    } catch (e) {
      setStatus(before);
      toast.error('Could not save that setting', { id: 'autopilot-setting', description: e instanceof Error ? e.message : 'Check your connection and try again.' });
    }
  }, [status, projectId]);

  const scanNow = useCallback(async () => {
    if (!project || scanning) return;
    try {
      const res = await api.analyzeReddit({
        brand_id: projectId,
        keywords: project.keywords || [],
        subreddits: project.subreddits || [],
        time_period: 'month',
        limit: 1000,
      });
      if (res.status === 'started') {
        setScanning(true);
        toast.info('Scanning Reddit for new leads', { description: 'Results land in Opportunities in a minute or two.' });
      } else if (res.status === 'already_running') {
        setScanning(true);
        toast.warning('A scan is already in progress');
      } else if (res.status === 'cooldown') {
        toast.error(res.message || 'Scans are limited to once every 10 minutes');
      }
    } catch (e) {
      toast.error('Failed to start scan', { description: e instanceof Error ? e.message : undefined });
    }
  }, [project, projectId, scanning]);

  const plan = status ? (status.interval_hours <= 6 ? 'Growth' : 'Starter') : null;

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[760px]">
        <QueueHeader
          projectName={project?.name}
          title="Autopilot"
          lede={`Scans on a schedule and drafts a reply for every lead that scores ${status?.min_score ?? 80} or more. Replies wait in the Reply queue; nothing is posted for you.`}
        />

        {error ? (
          <QueueError message={error} />
        ) : (
          <div className="space-y-4">
            <section className={`${STICKER_PANEL} p-6`} aria-busy={!status}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-play text-[22px] font-bold tracking-[-0.02em] text-ink-900">
                    {status ? (status.enabled ? 'Autopilot is on' : 'Autopilot is off') : 'Loading'}
                  </p>
                  <p className="mt-1 text-[13.5px] text-ink-600">
                    {status
                      ? status.enabled
                        ? `Scans every ${status.interval_hours} hours on ${plan}.`
                        : 'Nothing runs until you turn it back on. Scan now still works.'
                      : ' '}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!status?.enabled}
                  aria-label="Autopilot"
                  onClick={toggle}
                  disabled={!status || saving}
                  className={`relative h-11 w-[84px] shrink-0 rounded-full border-2 border-[#1c1917] shadow-[3px_3px_0_#1c1917] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2 disabled:opacity-50
                    ${status?.enabled ? 'bg-[#059669]' : 'bg-white'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-1 h-7 w-7 rounded-full border-2 border-[#1c1917] bg-white transition-[left] duration-150 motion-reduce:transition-none
                      ${status?.enabled ? 'left-[46px]' : 'left-1'}`}
                  />
                  <span className="sr-only">{status?.enabled ? 'On' : 'Off'}</span>
                </button>
              </div>
            </section>

            <section className={`${PANEL} divide-y-2 divide-[#1c1917]/[0.06]`} aria-labelledby="drafting-heading" aria-busy={!status}>
              <div className="px-5 pb-3 pt-5 sm:px-6">
                <h2 id="drafting-heading" className="font-play text-[18px] font-bold tracking-[-0.015em] text-ink-900">Drafting</h2>
                <p className="mt-0.5 text-[13px] text-ink-600">Changes save as you make them and apply from the next scan.</p>
              </div>

              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink-900">Draft replies for leads scoring at least</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-400">Higher means fewer, better drafts.</p>
                </div>
                {status ? (
                  <Segmented
                    label="Draft replies for leads scoring at least"
                    value={status.min_score}
                    options={status.min_score_choices}
                    onChange={(n) => saveSetting({ min_score: n }, `Drafting replies for leads scoring ${n} or more`)}
                  />
                ) : <div className="h-10 w-[290px] max-w-full rounded-xl bg-[#f7f6f4]" />}
              </div>

              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-ink-900">Drafts per day</p>
                  <p className="mt-0.5 text-[12.5px] tabular-nums text-ink-400">
                    {status ? `${status.drafted_today} of ${status.daily_cap} used today. Resets at midnight UTC.` : ' '}
                  </p>
                </div>
                {status ? (
                  <Segmented
                    label="Drafts per day"
                    value={status.daily_cap}
                    options={status.daily_cap_choices}
                    onChange={(n) => saveSetting({ daily_cap: n }, `Up to ${n} drafts a day`)}
                  />
                ) : <div className="h-10 w-[230px] max-w-full rounded-xl bg-[#f7f6f4]" />}
              </div>

              <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <p id="draft-dms-label" className="text-[14px] font-semibold text-ink-900">Draft DMs too</p>
                  <p className="mt-0.5 text-[12.5px] text-ink-400">
                    {status
                      ? `Also drafts a private message for leads scoring ${status.dm_min_score} or more, when we know who posted. You send it yourself from the DM queue.`
                      : ' '}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!status?.draft_dms}
                  aria-labelledby="draft-dms-label"
                  disabled={!status}
                  onClick={() => status && saveSetting({ draft_dms: !status.draft_dms }, status.draft_dms ? 'DM drafts are off' : 'DM drafts are on')}
                  className={`relative h-8 w-[60px] shrink-0 rounded-full border-2 border-[#1c1917] transition-colors duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2 disabled:opacity-50
                    ${status?.draft_dms ? 'bg-[#059669]' : 'bg-white'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-[3px] h-5 w-5 rounded-full border-2 border-[#1c1917] bg-white transition-[left] duration-150 motion-reduce:transition-none
                      ${status?.draft_dms ? 'left-[33px]' : 'left-[3px]'}`}
                  />
                </button>
              </div>

              <p className="px-5 py-3.5 text-[12.5px] text-ink-600 sm:px-6">
                Want drafts and scores to follow your own rules?{' '}
                <Link
                  href={`/projects?edit=${projectId}`}
                  className="rounded font-semibold text-ink-900 underline underline-offset-2 hover:text-[#b83200] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                >
                  Add custom instructions
                </Link>
              </p>
            </section>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className={`${PANEL} p-4`}>
                <dt className="text-[12px] font-semibold text-ink-400">Last scan</dt>
                <dd className="mt-1 text-[14px] font-semibold text-ink-900">{status ? fmt(status.last_scan_at) : ' '}</dd>
              </div>
              <div className={`${PANEL} p-4`}>
                <dt className="text-[12px] font-semibold text-ink-400">Next scan</dt>
                <dd className="mt-1 text-[14px] font-semibold text-ink-900">
                  {status ? (status.enabled ? (status.next_scan_at ? fmt(status.next_scan_at) : 'Within the hour') : 'Paused') : ' '}
                </dd>
              </div>
              <div className={`${PANEL} p-4`}>
                <dt className="text-[12px] font-semibold text-ink-400">Replies drafted, last 7 days</dt>
                <dd className="mt-1 font-play text-[22px] font-extrabold tabular-nums leading-none text-ink-900">{status ? status.drafted_last_7d : ' '}</dd>
              </div>
            </dl>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button onClick={scanNow} disabled={!project || scanning} className={BTN_SECONDARY}>
                {scanning ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
                {scanning ? 'Scanning' : 'Scan now'}
              </button>
              <p className="text-[12.5px] text-ink-400">Starter scans every 24 hours, Growth every 6.</p>
            </div>
          </div>
        )}
      </div>
    </PaymentGuard>
  );
}
