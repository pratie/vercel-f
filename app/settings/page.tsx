'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    tone: 'friendly',
    basePrompt: '',
    templates: {
      productInfo: '',
      support: '',
      feedback: '',
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load settings when the page loads
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Failed to load settings');
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8">AI Response Settings</h1>
      
      <div className="space-y-6">
        {/* Brand Tone Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Brand Tone</CardTitle>
            <CardDescription>
              Choose how you want the AI to communicate with your audience.
              This will affect the overall style of all generated responses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={settings.tone}
              onValueChange={(value) => setSettings({ ...settings, tone: value })}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-orange-500">
                <RadioGroupItem value="friendly" id="friendly" />
                <Label htmlFor="friendly" className="cursor-pointer">
                  <div className="font-medium">Friendly & Casual</div>
                  <p className="text-sm text-gray-500">Warm, approachable, conversational style</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-orange-500">
                <RadioGroupItem value="professional" id="professional" />
                <Label htmlFor="professional" className="cursor-pointer">
                  <div className="font-medium">Professional</div>
                  <p className="text-sm text-gray-500">Formal, business-oriented approach</p>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:border-orange-500">
                <RadioGroupItem value="technical" id="technical" />
                <Label htmlFor="technical" className="cursor-pointer">
                  <div className="font-medium">Technical</div>
                  <p className="text-sm text-gray-500">Detailed, specification-focused style</p>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Base Prompt */}
        <Card>
          <CardHeader>
            <CardTitle>Base Response Style</CardTitle>
            <CardDescription>
              Set the foundation for how the AI should structure its responses.
              This will be combined with your selected tone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Example: Always start with a greeting, address the main point, and end with a call to action..."
              value={settings.basePrompt}
              onChange={(e) => setSettings({ ...settings, basePrompt: e.target.value })}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Response Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Response Templates</CardTitle>
            <CardDescription>
              Create templates for common scenarios. The AI will adapt these based on the context
              and your selected tone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base">Product Information Template</Label>
              <Textarea
                placeholder="How you typically describe your products/services..."
                value={settings.templates.productInfo}
                onChange={(e) => setSettings({
                  ...settings,
                  templates: { ...settings.templates, productInfo: e.target.value }
                })}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-base">Support Response Template</Label>
              <Textarea
                placeholder="How you handle questions and support inquiries..."
                value={settings.templates.support}
                onChange={(e) => setSettings({
                  ...settings,
                  templates: { ...settings.templates, support: e.target.value }
                })}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-base">Feedback & Suggestions Template</Label>
              <Textarea
                placeholder="How you respond to feedback and suggestions..."
                value={settings.templates.feedback}
                onChange={(e) => setSettings({
                  ...settings,
                  templates: { ...settings.templates, feedback: e.target.value }
                })}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-[#ff4500] hover:bg-[#ff4500]/90 w-full"
        >
          {isLoading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
