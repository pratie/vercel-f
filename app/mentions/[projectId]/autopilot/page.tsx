'use client';

// Autopilot: one switch. On means scheduled scans plus auto-drafted replies
// for leads scoring 80 or more. Off means you scan by hand.

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';
import { PaymentGuard } from '@/components/PaymentGuard';
import { QueueError, QueueHeader } from '@/components/mentions/QueueHeader';
import { api, AutopilotStatus, Project } from '@/lib/api';
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
          lede="Scans on a schedule and drafts a reply for every lead that scores 80 or more. Replies wait in the Reply queue; nothing is posted for you."
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
