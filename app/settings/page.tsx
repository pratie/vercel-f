'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { CheckCircle2, AlertTriangle, Mail, User, Bell, SlidersHorizontal } from 'lucide-react';
import { useRedditAuthStore } from '@/lib/redditAuth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { PaymentGuard } from '@/components/PaymentGuard';

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

type TabId = 'account' | 'notifications' | 'preferences';

const TABS: { id: TabId; label: string; icon: typeof User }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
];

const TONE_OPTIONS: { value: Tone; title: string; body: string }[] = [
  { value: 'friendly', title: 'Friendly & Casual', body: 'Warm, approachable style' },
  { value: 'professional', title: 'Professional', body: 'Business-oriented approach' },
  { value: 'technical', title: 'Technical', body: 'Detailed, technical style' },
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
  return <div className={cn('animate-pulse rounded-md bg-gray-100', className)} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
      {children}
    </p>
  );
}

function SettingsCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn('bg-white rounded-2xl shadow-card p-6', className)}>
      {children}
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-orange-500' : 'bg-gray-200'
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
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const redditAuth = useRedditAuthStore();

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

    const urlParams = new URLSearchParams(window.location.search);

    // Restore active tab from the URL
    const tabParam = urlParams.get('tab');
    if (tabParam === 'account' || tabParam === 'notifications' || tabParam === 'preferences') {
      setActiveTab(tabParam);
    }

    // Check for the reddit_connected query parameter
    if (urlParams.get('reddit_connected') === 'true') {
      toast.success('Successfully connected to Reddit!');
      // Clear the parameter without reloading the page (keep any others, e.g. ?tab=)
      urlParams.delete('reddit_connected');
      const rest = urlParams.toString();
      window.history.replaceState(
        {},
        document.title,
        rest ? `${window.location.pathname}?${rest}` : window.location.pathname
      );

      // Use direct status check instead of the wrapper function
      redditAuth.checkStatus(true);
    }
    // Don't automatically check status otherwise - let the user connect manually
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTab = (tab: TabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

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

  return (
    <PaymentGuard>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SectionLabel>Workspace</SectionLabel>
        <h1 className="text-2xl font-bold text-gray-900 mt-1 mb-6">Settings</h1>

        {/* Pill tabs, synced to ?tab= */}
        <div
          role="tablist"
          aria-label="Settings sections"
          className="flex gap-1 p-1 bg-gray-100/80 rounded-lg w-full sm:w-fit mb-6"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => selectTab(id)}
              className={cn(
                'flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors',
                activeTab === id
                  ? 'bg-white shadow-sm text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Account ── */}
        {activeTab === 'account' && (
          <SettingsCard>
            <SectionLabel>Reddit account</SectionLabel>
            <h2 className="text-sm font-semibold text-gray-900 mt-1">Reddit Connection</h2>
            <p className="text-[13px] text-gray-500 mt-1 mb-5">
              Connect your Reddit account to post comments directly from this application.
            </p>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3.5">
              {redditAuth.isAuthenticated ? (
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="text-[13px] text-gray-700 truncate">
                    Connected as{' '}
                    <span className="font-semibold text-gray-900">{redditAuth.username}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                  <span className="text-[13px] text-gray-500">Not connected</span>
                </div>
              )}

              {redditAuth.isAuthenticated ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-600 shrink-0"
                  onClick={async () => {
                    console.log('Disconnect Reddit button clicked');
                    toast.info('Disconnecting from Reddit...');

                    try {
                      const success = await redditAuth.disconnectReddit();
                      if (success) {
                        toast.success('Successfully disconnected from Reddit');
                      } else {
                        toast.error('Failed to disconnect from Reddit');
                      }
                    } catch (error) {
                      console.error('Error in disconnect flow:', error);
                      toast.error('Failed to disconnect from Reddit', {
                        description: 'Please check the console for more details',
                      });
                    }
                  }}
                  disabled={redditAuth.isLoading || redditAuth.isStatusLoading}
                >
                  {redditAuth.isLoading ? 'Disconnecting...' : 'Disconnect'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                  onClick={() => {
                    toast.info('Connecting to Reddit...', {
                      description: 'A popup window will open for authentication',
                    });

                    redditAuth.connectReddit().catch((error) => {
                      console.error('Error in Reddit connection flow:', error);
                    });
                  }}
                  disabled={redditAuth.isLoading || redditAuth.isStatusLoading}
                >
                  {redditAuth.isLoading || redditAuth.isStatusLoading
                    ? 'Connecting...'
                    : 'Connect with Reddit'}
                </Button>
              )}
            </div>

            {redditAuth.error && (
              <div className="text-xs text-red-600 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="font-semibold">Error connecting to Reddit:</div>
                <div className="mt-0.5">{redditAuth.error}</div>
              </div>
            )}

            <div className="text-xs text-gray-400 mt-4 space-y-1">
              <p>Connecting your Reddit account allows you to post comments directly from this application.</p>
              <p>Your account connection will be used only for posting comments you explicitly approve.</p>
              <p>You can post up to 5 comments per 24 hours due to Reddit&apos;s rate limiting.</p>
            </div>
          </SettingsCard>
        )}

        {/* ── Notifications ── */}
        {activeTab === 'notifications' && (
          <SettingsCard>
            <SectionLabel>Alerts</SectionLabel>
            <h2 className="text-sm font-semibold text-gray-900 mt-1">Email Notifications</h2>
            <p className="text-[13px] text-gray-500 mt-1 mb-5">
              Configure how you receive email notifications for new Reddit mentions.
            </p>

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
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-gray-900">
                      Enable Email Notifications
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Receive alerts via email</p>
                  </div>
                  <Toggle
                    label="Enable email notifications"
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

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                    Frequency
                  </p>
                  <div
                    className={cn(
                      'flex gap-1 p-1 bg-gray-100/80 rounded-lg w-fit',
                      !alertSettings.enable_email_alerts && 'opacity-50 pointer-events-none'
                    )}
                    role="radiogroup"
                    aria-label="Notification frequency"
                  >
                    {(
                      [
                        { value: 'daily', label: 'Daily Digest' },
                        { value: 'weekly', label: 'Weekly Summary' },
                      ] as const
                    ).map(({ value, label }) => {
                      const current =
                        alertSettings.alert_frequency === 'realtime' ||
                        !alertSettings.alert_frequency
                          ? 'daily'
                          : alertSettings.alert_frequency;
                      return (
                        <button
                          key={value}
                          role="radio"
                          aria-checked={current === value}
                          disabled={!alertSettings.enable_email_alerts}
                          onClick={() => {
                            if (current !== value) {
                              updateAlerts({ alert_frequency: value });
                            }
                          }}
                          className={cn(
                            'px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                            current === value
                              ? 'bg-white shadow-sm text-gray-900'
                              : 'text-gray-500 hover:text-gray-700'
                          )}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {alertSettings.enable_email_alerts ? (
                  <div className="flex items-center gap-2 rounded-lg bg-orange-50 px-3 py-2.5 text-xs text-orange-700">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {alertSettings.alert_frequency === 'weekly'
                      ? 'Weekly summary lands in your inbox every Monday morning'
                      : 'Daily digest lands in your inbox each morning'}
                  </div>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      Email notifications are disabled. Enable them to receive updates when new
                      Reddit mentions are found.
                    </span>
                  </div>
                )}
              </div>
            )}
          </SettingsCard>
        )}

        {/* ── Preferences ── */}
        {activeTab === 'preferences' && (
          <div className="space-y-5">
            <SettingsCard>
              <SectionLabel>Reply voice</SectionLabel>
              <h2 className="text-sm font-semibold text-gray-900 mt-1 mb-4">Brand Tone</h2>

              {isPrefsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              ) : (
                <RadioGroup
                  value={settings.tone}
                  onValueChange={(value: Tone) => setSettings({ ...settings, tone: value })}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                >
                  {TONE_OPTIONS.map(({ value, title, body }) => (
                    <Label
                      key={value}
                      htmlFor={value}
                      className={cn(
                        'flex items-start gap-2.5 rounded-xl border p-3.5 cursor-pointer transition-colors',
                        settings.tone === value
                          ? 'border-orange-500 bg-orange-50/50'
                          : 'border-gray-200 hover:border-orange-300'
                      )}
                    >
                      <RadioGroupItem value={value} id={value} className="mt-0.5" />
                      <span className="block">
                        <span className="block text-[13px] font-semibold text-gray-900">
                          {title}
                        </span>
                        <span className="block text-xs text-gray-400 mt-0.5 font-normal">
                          {body}
                        </span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </SettingsCard>

            <SettingsCard>
              <SectionLabel>Reply structure</SectionLabel>
              <h2 className="text-sm font-semibold text-gray-900 mt-1 mb-4">Response Style</h2>

              {isPrefsLoading ? (
                <Skeleton className="h-[100px] w-full rounded-lg" />
              ) : (
                <Textarea
                  placeholder="Example: Always start with a greeting, address the main point, and end with a call to action..."
                  value={settings.response_style || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, response_style: e.target.value || null })
                  }
                  className="min-h-[100px] text-[13px]"
                />
              )}
            </SettingsCard>

            <Button
              onClick={handleSavePreferences}
              disabled={isSaving || isPrefsLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSaving ? 'Saving...' : 'Save Brand Settings'}
            </Button>
          </div>
        )}
      </div>
    </PaymentGuard>
  );
}
