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
    telegram_chat_id: '',
    enable_telegram_alerts: false,
    enable_email_alerts: false,
    alert_frequency: 'daily'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertLoading, setIsAlertLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAlertSaved, setIsAlertSaved] = useState(false);
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
        setAlertSettings(data);
      } catch (error) {
        console.error('Error loading alert settings:', error);
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
    setIsSaved(false);
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
      toast.success('Settings saved successfully');
      setIsSaved(true);
      // Reset the saved state after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAlertSettings = async () => {
    setIsAlertLoading(true);
    setIsAlertSaved(false);
    console.log('Saving alert settings:', alertSettings);

    try {
      // Always set is_active to true since we removed the toggle
      const data = await api.updateAlertSettings({
        ...alertSettings,
        is_active: true
      });
      console.log('Save successful, updated alert settings:', data);
      setAlertSettings(data);
      toast.success('Alert settings saved successfully');
      setIsAlertSaved(true);
      // Reset the saved state after 2 seconds
      setTimeout(() => setIsAlertSaved(false), 2000);
    } catch (error) {
      console.error('Error saving alert settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save alert settings');
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
                        className="bg-[#ff4500] hover:bg-[#ff4500]/90"
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
            {/* Alert Settings */}
            <Card>
              <CardContent className="pt-4">
                <Stack gap="lg">
                  {/* Telegram Settings */}
                  <Box>
                    <Text fw={500} size="lg" mb="xs">Telegram Alerts</Text>
                    
                    <Stack gap="xs">
                      <TextInput
                        label="Telegram Chat ID"
                        placeholder="Enter your Telegram Chat ID"
                        value={alertSettings.telegram_chat_id}
                        onChange={(e) => setAlertSettings({
                          ...alertSettings,
                          telegram_chat_id: e.target.value
                        })}
                      />
                      
                      <Box className="telegram-instructions" p="md" bg="#f8f9fa" style={{ borderLeft: '3px solid #ff4500', borderRadius: '4px' }}>
                        <Text fw={600} mb="xs">How to get your Chat ID:</Text>
                        <Text size="sm">1. Open Telegram and search for <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer">@userinfobot</a></Text>
                        <Text size="sm">2. Start a chat with this bot and send the "/start" command</Text>
                        <Text size="sm">3. Copy the ID number it provides and paste it here</Text>
                      </Box>
                      
                      <Group justify="space-between" mt="md">
                        <Stack gap={0}>
                          <Text>Enable Telegram Alerts</Text>
                          <Text size="xs" c="dimmed">Receive alerts via Telegram</Text>
                        </Stack>
                        <Switch
                          checked={alertSettings.enable_telegram_alerts}
                          onChange={(event) => setAlertSettings({
                            ...alertSettings,
                            enable_telegram_alerts: event.currentTarget.checked
                          })}
                          color="orange"
                        />
                      </Group>
                    </Stack>
                  </Box>
                  
                  {/* Alert Frequency */}
                  <Select
                    label="Alert Frequency"
                    placeholder="Select frequency"
                    value={alertSettings.alert_frequency}
                    onChange={(value) => setAlertSettings({
                      ...alertSettings,
                      alert_frequency: value as 'daily' | 'weekly' | 'realtime'
                    })}
                    data={[
                      { value: 'realtime', label: 'Real-time' },
                      { value: 'daily', label: 'Daily Digest' },
                      { value: 'weekly', label: 'Weekly Summary' }
                    ]}
                  />
                  
                  {/* Only show warning if Telegram alerts are disabled */}
                  {!alertSettings.enable_telegram_alerts && (
                    <Alert 
                      icon={<AlertTriangle size={16} />} 
                      title="Alerts are disabled" 
                      color="yellow"
                    >
                      Enable Telegram alerts to receive notifications when new Reddit mentions are found.
                    </Alert>
                  )}
                  
                  {/* Show success message when Telegram alerts are enabled */}
                  {alertSettings.enable_telegram_alerts && (
                    <Alert 
                      icon={<CheckCircle2 size={16} />} 
                      title="Alerts are enabled" 
                      color="green"
                    >
                      You will receive Telegram notifications when new Reddit mentions are found.
                    </Alert>
                  )}
                  
                  {/* Save Button */}
                  <Button 
                    onClick={handleSaveAlertSettings} 
                    disabled={isAlertLoading}
                    className={cn(
                      "w-full transition-colors",
                      isAlertLoading ? "bg-gray-400" :
                      isAlertSaved ? "bg-green-500 hover:bg-green-600" :
                      "bg-[#ff4500] hover:bg-[#ff4500]/90"
                    )}
                  >
                    {isAlertLoading ? 'Saving...' : 
                     isAlertSaved ? 'Saved!' : 
                     'Save Alert Settings'}
                  </Button>
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
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-orange-500">
                      <RadioGroupItem value="friendly" id="friendly" />
                      <Label htmlFor="friendly" className="cursor-pointer">
                        <div className="font-medium">Friendly & Casual</div>
                        <p className="text-sm text-gray-500">Warm, approachable style</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-orange-500">
                      <RadioGroupItem value="professional" id="professional" />
                      <Label htmlFor="professional" className="cursor-pointer">
                        <div className="font-medium">Professional</div>
                        <p className="text-sm text-gray-500">Business-oriented approach</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-orange-500">
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
                  isSaved ? "bg-green-500 hover:bg-green-600" :
                  "bg-[#ff4500] hover:bg-[#ff4500]/90"
                )}
              >
                {isLoading ? 'Saving...' : 
                 isSaved ? 'Saved!' : 
                 'Save Brand Settings'}
              </Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </div>
    </PaymentGuard>
  );
}
