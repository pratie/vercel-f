'use client';

import { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, Mail, Loader2 } from 'lucide-react';
import { api, PaymentStatus } from '@/lib/api';
import { getUserEmail } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { PaymentGuard } from '@/components/PaymentGuard';
import { BTN_PRIMARY, BTN_SECONDARY, PANEL } from '@/components/ui/sticker';

type Tone = 'friendly' | 'professional' | 'technical';

interface PreferencesResponse {
  tone: Tone;
  response_style: string | null;
  created_at: string;
  updated_at: string;
}

interface AlertSettings {
  telegram_chat_id: string;
  enable_telegram_alerts: boolean;
  enable_email_alerts: boolean;
  alert_frequency: 'daily' | 'weekly' | 'realtime';
  is_active?: boolean;
}

const TONE_OPTIONS: { value: Tone; title: string; body: string }[] = [
  { value: 'friendly', title: 'Friendly', body: 'Warm and casual, like a founder in the thread' },
  { value: 'professional', title: 'Professional', body: 'Clear and businesslike' },
  { value: 'technical', title: 'Technical', body: 'Detailed, for developer audiences' },
];

/** Normalize an alert-settings API payload into UI state. */
function normalizeAlerts(data: Partial<AlertSettings>): AlertSettings {
  const isActive =
    data.is_active !== undefined ? data.is_active : data.enable_email_alerts || false;
  return {
    telegram_chat_id: data.telegram_chat_id || '',
    enable_telegram_alerts: false, // Always false for UI logic
    enable_email_alerts: isActive, // Primary UI toggle state
    alert_frequency:
      data.alert_frequency === 'realtime' ? 'daily' : data.alert_frequency || 'daily',
    is_active: isActive,
  };
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-cream', className)} />;
}

/** One settings section: a heading, one line of context, then the controls. */
function SettingsSection({
  id,
  title,
  sub,
  children,
}: {
  id: string;
  title: string;
  sub?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className={cn(PANEL, 'p-5 sm:p-6')}>
      <h2 id={`${id}-heading`} className="font-play text-[20px] font-bold tracking-[-0.015em] text-ink-900">
        {title}
      </h2>
      {sub && <p className="mt-1 text-[13px] text-ink-400">{sub}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toggle({
  checked,
  onCheckedChange,
  disabled,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/50 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-[#059669]' : 'bg-ink-300'
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PreferencesResponse>({
    tone: 'friendly',
    response_style: null,
    created_at: '',
    updated_at: '',
  });
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    telegram_chat_id: '', // Kept for API compatibility, not used in UI
    enable_telegram_alerts: false, // Kept for API compatibility, always false
    enable_email_alerts: false,
    alert_frequency: 'daily',
    is_active: false,
  });
  const [isPrefsLoading, setIsPrefsLoading] = useState(true);
  const [isAlertsLoading, setIsAlertsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [payment, setPayment] = useState<PaymentStatus | null>(null);

  // Load settings when the page loads
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getPreferences();
        setSettings(data);
      } catch (error) {
        console.error('Error loading preferences:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load preferences');
      } finally {
        setIsPrefsLoading(false);
      }
    };

    const loadAlertSettings = async () => {
      try {
        const data = await api.getAlertSettings();
        setAlertSettings(normalizeAlerts(data));
      } catch (error) {
        console.error('Error loading alert settings:', error);
        // Fallback state on error
        setAlertSettings({
          telegram_chat_id: '',
          enable_telegram_alerts: false,
          enable_email_alerts: false,
          alert_frequency: 'daily',
          is_active: false,
        });
        toast.error(error instanceof Error ? error.message : 'Failed to load alert settings');
      } finally {
        setIsAlertsLoading(false);
      }
    };

    loadSettings();
    loadAlertSettings();
    api.getPaymentStatus().then(setPayment).catch(() => setPayment(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Optimistic save: state is applied immediately by the caller, we confirm or roll back.
  const saveAlertSettings = async (updated: AlertSettings, previous: AlertSettings) => {
    const settingsToSave: AlertSettings = {
      ...updated,
      telegram_chat_id: updated.telegram_chat_id || '',
      enable_telegram_alerts: false,
      is_active: updated.enable_email_alerts,
      alert_frequency:
        updated.alert_frequency === 'realtime' || !updated.alert_frequency
          ? 'daily'
          : updated.alert_frequency,
    };

    try {
      const data = await api.updateAlertSettings(settingsToSave);
      // Reconcile with the server's response
      setAlertSettings(normalizeAlerts(data));
      toast.success('Notification settings saved');
    } catch (error) {
      console.error('Error saving alert settings:', error);
      setAlertSettings(previous); // Roll back the optimistic update
      toast.error(
        error instanceof Error ? error.message : 'Failed to save notification settings'
      );
    }
  };

  const updateAlerts = (changes: Partial<AlertSettings>) => {
    const previous = alertSettings;
    const updated: AlertSettings = { ...alertSettings, ...changes };
    setAlertSettings(updated); // Optimistic
    saveAlertSettings(updated, previous);
  };

  const handleSavePreferences = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const data = await api.updatePreferences({
        tone: settings.tone,
        response_style: settings.response_style,
      });
      setSettings(data);
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const planName =
    payment?.subscription_plan === 'growth_monthly' ? 'Growth'
      : payment?.subscription_plan === 'starter_monthly' ? 'Starter'
        : 'Pro';
  const frequency =
    alertSettings.alert_frequency === 'realtime' || !alertSettings.alert_frequency
      ? 'daily'
      : alertSettings.alert_frequency;

  return (
    <PaymentGuard>
      <div className="mx-auto max-w-[760px]">
        <header className="mb-6">
          <h1 className="font-play text-[30px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink-900 sm:text-[34px]">
            Settings
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-400">
            Signed in as <span className="text-ink-600">{getUserEmail() || '…'}</span>
          </p>
        </header>

        <div className="space-y-5">
          {/* ── Plan ── */}
          <SettingsSection id="plan" title="Plan and billing">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3.5">
              {payment === null ? (
                <span className="text-[13px] text-ink-400">Loading plan</span>
              ) : payment.has_paid ? (
                <div className="flex min-w-0 items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
                  <span className="text-[13.5px] text-ink-700">
                    <span className="font-semibold text-ink-900">{planName} plan</span>
                    {payment.plan_expires_at && (
                      <span className="text-ink-400">
                        {' '}· {payment.has_subscription && payment.subscription_status === 'active' ? 'renews' : 'access until'}{' '}
                        {new Date(payment.plan_expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-ink-300" aria-hidden="true" />
                  <span className="text-[13.5px] text-ink-700">
                    <span className="font-semibold text-ink-900">Free</span>
                    <span className="text-ink-400"> · analysis only</span>
                  </span>
                </div>
              )}

              {payment !== null && !payment.has_paid && (
                <a href="/upgrade" className={BTN_PRIMARY}>
                  Upgrade
                </a>
              )}
              {payment?.has_subscription && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      window.location.href = await api.openBillingPortal();
                    } catch {
                      toast.error('Could not open billing. Please try again.');
                    }
                  }}
                  className={BTN_SECONDARY}
                >
                  Manage billing
                </button>
              )}
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-400">
              SneakyGuy drafts replies for you; you review and post them yourself from your own Reddit account, which keeps it in good standing.
            </p>
          </SettingsSection>

          {/* ── Reply voice ── */}
          <SettingsSection
            id="voice"
            title="Reply voice"
            sub="How drafted replies should sound. Applies to every project."
          >
            {isPrefsLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
                <Skeleton className="h-[100px] w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-[13px] font-semibold text-ink-900">Tone</p>
                  <RadioGroup
                    value={settings.tone}
                    onValueChange={(value: Tone) => setSettings({ ...settings, tone: value })}
                    className="grid grid-cols-1 gap-2.5 sm:grid-cols-3"
                  >
                    {TONE_OPTIONS.map(({ value, title, body }) => (
                      <Label
                        key={value}
                        htmlFor={value}
                        className={cn(
                          'flex cursor-pointer items-start gap-2.5 rounded-xl border-2 p-3.5 transition-[border-color,box-shadow] motion-reduce:transition-none',
                          settings.tone === value
                            ? 'border-[#1c1917] bg-white shadow-[3px_3px_0_#1c1917]'
                            : 'border-[#1c1917]/[0.12] hover:border-[#1c1917]/40'
                        )}
                      >
                        <RadioGroupItem value={value} id={value} className="mt-0.5" />
                        <span className="block">
                          <span className="block text-[13.5px] font-semibold text-ink-900">{title}</span>
                          <span className="mt-0.5 block text-[12px] font-normal leading-snug text-ink-400">{body}</span>
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="response-style" className="mb-2 block text-[13px] font-semibold text-ink-900">
                    Anything else the draft should always do
                  </Label>
                  <Textarea
                    id="response-style"
                    placeholder="Example: open with a question back, mention the free plan, never use bullet points."
                    value={settings.response_style || ''}
                    onChange={(e) =>
                      setSettings({ ...settings, response_style: e.target.value || null })
                    }
                    className="min-h-[96px] rounded-xl border-2 border-[#1c1917]/[0.12] text-[13.5px] focus-visible:border-[#1c1917] focus-visible:ring-0"
                  />
                </div>

                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving || isPrefsLoading}
                  className={BTN_PRIMARY}
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {isSaving ? 'Saving' : 'Save reply voice'}
                </button>
              </div>
            )}
          </SettingsSection>

          {/* ── Alerts ── */}
          <SettingsSection
            id="alerts"
            title="Email alerts"
            sub="A digest of new leads, sent to your sign-in address."
          >
            {isAlertsLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
                <Skeleton className="h-9 w-64 rounded-lg" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13.5px] font-semibold text-ink-900">Send me new leads by email</p>
                    <p className="mt-0.5 text-[12.5px] text-ink-400">Saved as soon as you switch it.</p>
                  </div>
                  <Toggle
                    label="Send new leads by email"
                    checked={alertSettings.enable_email_alerts}
                    onCheckedChange={(checked) => {
                      updateAlerts({
                        enable_email_alerts: checked,
                        alert_frequency: checked ? alertSettings.alert_frequency : 'daily',
                        is_active: checked,
                      });
                    }}
                  />
                </div>

                <div className={cn(!alertSettings.enable_email_alerts && 'opacity-50')}>
                  <p className="mb-2 text-[13px] font-semibold text-ink-900">How often</p>
                  <div
                    className="inline-flex gap-1 rounded-xl border-2 border-[#1c1917]/[0.12] p-1"
                    role="radiogroup"
                    aria-label="Alert frequency"
                  >
                    {(
                      [
                        { value: 'daily', label: 'Daily' },
                        { value: 'weekly', label: 'Weekly' },
                      ] as const
                    ).map(({ value, label }) => (
                      <button
                        key={value}
                        role="radio"
                        aria-checked={frequency === value}
                        disabled={!alertSettings.enable_email_alerts}
                        onClick={() => {
                          if (frequency !== value) updateAlerts({ alert_frequency: value });
                        }}
                        className={cn(
                          'h-8 rounded-lg px-3.5 text-[13px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40 disabled:cursor-not-allowed',
                          frequency === value
                            ? 'bg-[#1c1917] text-white'
                            : 'text-ink-600 hover:bg-cream hover:text-ink-900'
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {alertSettings.enable_email_alerts ? (
                  <p className="flex items-start gap-2 rounded-xl bg-[#ff4500]/[0.08] px-3.5 py-3 text-[12.5px] leading-snug text-[#b83200]">
                    <Mail className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {/* Nothing sends digests yet. Say so instead of promising an email. */}
                    Saved. Email digests switch on in the next update, and this setting carries over.
                  </p>
                ) : (
                  <p className="flex items-start gap-2 rounded-xl bg-cream px-3.5 py-3 text-[12.5px] leading-snug text-ink-600">
                    <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    Alerts are off. Switch them on to hear about new leads without opening the app.
                  </p>
                )}
              </div>
            )}
          </SettingsSection>
        </div>
      </div>
    </PaymentGuard>
  );
}
