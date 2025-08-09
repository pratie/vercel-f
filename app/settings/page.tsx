'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { useRedditAuthStore } from '@/lib/redditAuth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { PaymentGuard } from '@/components/PaymentGuard';
import { TextInput, Switch, Select, Group, Text, Stack, Box, Alert, Tabs } from '@mantine/core';
import { API_BASE_URL } from '@/config';

type Tone = "friendly" | "professional" | "technical";

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<PreferencesResponse>({
    tone: 'friendly',
    response_style: null,
    created_at: '',
    updated_at: ''
  });
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    telegram_chat_id: '', // Kept for API compatibility, not used in UI
    enable_telegram_alerts: false, // Kept for API compatibility, always false
    enable_email_alerts: false, // Main toggle for email notifications
    alert_frequency: 'daily', // Default, options: 'daily', 'weekly'
    is_active: false // Reflects overall notification status, tied to enable_email_alerts
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertLoading, setIsAlertLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('account');
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
      }
    };
    
    const loadAlertSettings = async () => {
      try {
        const data = await api.getAlertSettings();
        const isActive = data.is_active !== undefined ? data.is_active : (data.enable_email_alerts || false);
        setAlertSettings({
          telegram_chat_id: data.telegram_chat_id || '',
          enable_telegram_alerts: false, // Always false for UI logic
          enable_email_alerts: isActive, // This is the primary UI toggle state
          alert_frequency: data.alert_frequency === 'realtime' ? 'daily' : (data.alert_frequency || 'daily'),
          is_active: isActive // Store the effective active state
        });
      } catch (error) {
        console.error('Error loading alert settings:', error);
        setAlertSettings({ // Fallback state on error
            telegram_chat_id: '',
            enable_telegram_alerts: false,
            enable_email_alerts: false,
            alert_frequency: 'daily',
            is_active: false
        });
        toast.error(error instanceof Error ? error.message : 'Failed to load alert settings');
      }
    };
    
    loadSettings();
    loadAlertSettings();
    
    // Check for the reddit_connected query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const redditConnected = urlParams.get('reddit_connected');
    
    if (redditConnected === 'true') {
      toast.success('Successfully connected to Reddit!');
      // Clear the URL parameter without reloading the page
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Use direct status check instead of the wrapper function
      redditAuth.checkStatus(true);
    }
    // Don't automatically check status otherwise - let the user connect manually
  }, [redditAuth]);

  const handleSave = async () => {
    setIsLoading(true);
    console.log('Saving preferences:', {
      tone: settings.tone,
      response_style: settings.response_style
    });

    try {
      const data = await api.updatePreferences({
        tone: settings.tone,
        response_style: settings.response_style
      });
      console.log('Save successful, updated settings:', data);
      setSettings(data);
      toast.success('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const autoSaveAlertSettings = async (newSettings: Partial<AlertSettings>) => {
    if (isAlertLoading) return; // Prevent multiple saves if one is in progress
    setIsAlertLoading(true);

    // Merge with current settings to ensure all fields are present for the API
    const settingsToSave: AlertSettings = {
      ...alertSettings, // Start with current state
      ...newSettings,   // Override with new changes
      telegram_chat_id: alertSettings.telegram_chat_id || '', // Ensure these are always set as per previous logic
      enable_telegram_alerts: false,
      is_active: newSettings.enable_email_alerts !== undefined ? newSettings.enable_email_alerts : alertSettings.enable_email_alerts
    };
    // Ensure frequency is valid
    if (settingsToSave.alert_frequency === 'realtime' || !settingsToSave.alert_frequency) {
        settingsToSave.alert_frequency = 'daily';
    }

    console.log('Auto-saving alert settings:', settingsToSave);

    try {
      const data = await api.updateAlertSettings(settingsToSave);
      const isActive = data.is_active !== undefined ? data.is_active : (data.enable_email_alerts || false);
      console.log('Auto-save successful, updated alert settings:', data);
      // Update local state with the response from the server
      setAlertSettings({
        telegram_chat_id: data.telegram_chat_id || '',
        enable_telegram_alerts: false,
        enable_email_alerts: isActive,
        alert_frequency: data.alert_frequency === 'realtime' ? 'daily' : (data.alert_frequency || 'daily'),
        is_active: isActive
      });
      toast.success('Notification settings saved!');
    } catch (error) {
      console.error('Error auto-saving alert settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save notification settings');
      // Optionally, revert to previous settings on error, or let user retry by toggling again
    } finally {
      setIsAlertLoading(false);
    }
  };

  return (
    <PaymentGuard>
      <div className="container max-w-4xl py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <Tabs value={activeTab} onChange={setActiveTab} color="orange">
          <Tabs.List grow mb="md">
            <Tabs.Tab value="account" fw={500}>Account</Tabs.Tab>
            <Tabs.Tab value="notifications" fw={500}>Notifications</Tabs.Tab>
            <Tabs.Tab value="preferences" fw={500}>Preferences</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="account">
            {/* Reddit Connection */}
            <Card>
              <CardHeader>
                <CardTitle>Reddit Connection</CardTitle>
                <CardDescription>
                  Connect your Reddit account to post comments directly from this application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Reddit Account</h3>
                      {redditAuth.isAuthenticated ? (
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <span>Connected as <span className="font-medium">{redditAuth.username}</span></span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                    
                    {redditAuth.isAuthenticated ? (
                      <Button 
                        variant="outline" 
                        className="border-red-500 text-red-500 hover:bg-red-50"
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
                              description: 'Please check the console for more details'
                            });
                          }
                        }}
                        disabled={redditAuth.isLoading || redditAuth.isStatusLoading}
                      >
                        {redditAuth.isLoading ? 'Disconnecting...' : 'Disconnect'}
                      </Button>
                    ) : (
                      <Button 
                        className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                        onClick={() => {
                          toast.info('Connecting to Reddit...', {
                            description: 'A popup window will open for authentication'
                          });
                          
                          redditAuth.connectReddit().catch(error => {
                            console.error('Error in Reddit connection flow:', error);
                          });
                        }}
                        disabled={redditAuth.isLoading || redditAuth.isStatusLoading}
                      >
                        {redditAuth.isLoading || redditAuth.isStatusLoading ? 'Connecting...' : 'Connect with Reddit'}
                      </Button>
                    )}
                  </div>
                  
                  {redditAuth.error && (
                    <div className="text-sm text-red-500 mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="font-medium">Error connecting to Reddit:</div>
                      <div>{redditAuth.error}</div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    <p>Connecting your Reddit account allows you to post comments directly from this application.</p>
                    <p>Your account connection will be used only for posting comments you explicitly approve.</p>
                    <p>You can post up to 5 comments per 24 hours due to Reddit's rate limiting.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            {/* Simplified Alert Settings for Email */}
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive email notifications for new Reddit mentions.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Stack gap="lg">
                  {/* Email Notification Settings */}
                  <Stack gap="md">
                    <Group justify="space-between" align="center">
                      <Stack gap={2}>
                        <Text>Enable Email Notifications</Text>
                        <Text size="xs" c="dimmed">Receive alerts via Email</Text>
                      </Stack>
                      <Switch
                        checked={alertSettings.enable_email_alerts}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        const newCheckedState = event.target.checked;
                        const newFrequency = newCheckedState ? alertSettings.alert_frequency : 'daily';
                        const updatedSettings = {
                          ...alertSettings,
                          enable_email_alerts: newCheckedState,
                          alert_frequency: newFrequency,
                          is_active: newCheckedState
                        };
                        setAlertSettings(updatedSettings);
                        autoSaveAlertSettings({ enable_email_alerts: newCheckedState, alert_frequency: newFrequency, is_active: newCheckedState });
                      }}
                        color="teal"
                        size="md"
                      />
                    </Group>
                    
                    <Select
                      label="Notification Frequency"
                      placeholder="Select frequency"
                      value={(alertSettings.alert_frequency === 'realtime' || !alertSettings.alert_frequency) ? 'daily' : alertSettings.alert_frequency}
                      onChange={(value) => {
                        if (value === 'daily' || value === 'weekly') {
                          const newFrequency = value as 'daily' | 'weekly';
                          const updatedSettings = {
                            ...alertSettings,
                            alert_frequency: newFrequency
                          };
                          setAlertSettings(updatedSettings);
                          autoSaveAlertSettings({ alert_frequency: newFrequency });
                        }
                      }}
                      data={[
                        { value: 'daily', label: 'Daily Digest' },
                        { value: 'weekly', label: 'Weekly Summary' }
                      ]}
                      disabled={!alertSettings.enable_email_alerts}
                      mt="xs"
                    />
                  </Stack>
                  
                  {/* Conditional Alert Messages for Email */}
                  {!alertSettings.enable_email_alerts && (
                    <Alert 
                      icon={<AlertTriangle size={16} />} 
                      title="Email Notifications are disabled" 
                      color="yellow"
                      variant="light"
                    >
                      Enable email notifications to receive updates when new Reddit mentions are found.
                    </Alert>
                  )}
                  
                  {alertSettings.enable_email_alerts && (
                    <Alert 
                      icon={<CheckCircle2 size={16} />} 
                      title="Email Notifications are enabled" 
                      color="green"
                      variant="light"
                    >
                      You will receive email notifications with a {alertSettings.alert_frequency === 'daily' ? 'daily digest' : 'weekly summary'} when new Reddit mentions are found.
                    </Alert>
                  )}
                  
                  {/* Save Button has been removed, settings save automatically */}
                </Stack>
              </CardContent>
            </Card>
          </Tabs.Panel>

          <Tabs.Panel value="preferences">
            <Stack gap="lg">
              {/* Brand Tone Selection */}
              <Card>
                <CardContent className="pt-4">
                  <Text fw={500} size="lg" mb="md">Brand Tone</Text>
                  <RadioGroup
                    value={settings.tone}
                    onValueChange={(value: Tone) => setSettings({ ...settings, tone: value })}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-[hsl(var(--primary))]">
                      <RadioGroupItem value="friendly" id="friendly" />
                      <Label htmlFor="friendly" className="cursor-pointer">
                        <div className="font-medium">Friendly & Casual</div>
                        <p className="text-sm text-gray-500">Warm, approachable style</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-[hsl(var(--primary))]">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="cursor-pointer">
                        <div className="font-medium">Professional</div>
                        <p className="text-sm text-gray-500">Business-oriented approach</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-[hsl(var(--primary))]">
                      <RadioGroupItem value="technical" id="technical" />
                      <Label htmlFor="technical" className="cursor-pointer">
                        <div className="font-medium">Technical</div>
                        <p className="text-sm text-gray-500">Detailed, technical style</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Base Response Style */}
              <Card>
                <CardContent className="pt-4">
                  <Text fw={500} size="lg" mb="md">Response Style</Text>
                  <Textarea
                    placeholder="Example: Always start with a greeting, address the main point, and end with a call to action..."
                    value={settings.response_style || ''}
                    onChange={(e) => setSettings({ ...settings, response_style: e.target.value || null })}
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>

              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className={cn(
                  "w-full transition-colors",
                  isLoading ? "bg-gray-400" :
                  "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
                )}
              >
                {isLoading ? 'Saving...' : 
                 'Save Brand Settings'}
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </div>
    </PaymentGuard>
  );
}
