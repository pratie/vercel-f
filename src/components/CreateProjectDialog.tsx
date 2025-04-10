// src/components/CreateProjectDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { PlusCircle, Tag, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; keywords: string[]; subreddits: string[] }) => Promise<void>;
}

export function CreateProjectDialog({ open, onOpenChange, onSubmit }: CreateProjectDialogProps) {
  const [step, setStep] = useState(1);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [regenerateCount, setRegenerateCount] = useState(0);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setName('');
      setDescription('');
      setKeywords([]);
      setSubreddits([]);
      setLoading(false);
      setRegenerateCount(0);
    }
  }, [open]);

  const handleAnalyze = async () => {
    if (!name || !description) {
      toast.error('Please enter both project name and description');
      return;
    }
    if (description.length < 10) {
      toast.error('Description should be at least 10 characters long');
      return;
    }

    setLoading(true);
    try {
      const analysis = await api.analyzeInitial({
        name,
        description
      });

      setKeywords(analysis.keywords);
      setSubreddits(analysis.subreddits.map(s => s.replace(/^r\//, '')));
      setStep(2);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (regenerateCount >= 2) {
      toast.error('Maximum regeneration attempts reached');
      return;
    }

    setLoading(true);
    try {
      const analysis = await api.analyzeInitial({
        name,
        description
      });

      setKeywords(analysis.keywords);
      setSubreddits(analysis.subreddits.map(s => s.replace(/^r\//, '')));
      setRegenerateCount(prev => prev + 1);
      toast.success('Keywords and subreddits regenerated');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to regenerate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        name,
        description,
        keywords,
        subreddits: subreddits.map(s => s.startsWith('r/') ? s : `r/${s}`),
      });
      onOpenChange(false);
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-xl overflow-y-auto max-h-[85vh] p-0 bg-white shadow-lg rounded-xl">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-t-xl">
          <DialogHeader className="space-y-1.5 text-white">
            <DialogTitle className="text-xl font-bold flex items-center">
              <PlusCircle className="h-5 w-5 mr-2" />
              Create New Project
            </DialogTitle>
            <p className="text-sm text-white/90">
              {step === 1 
                ? "Set up your project to start finding relevant leads on Reddit."
                : "Review and confirm your project's targeting"}
            </p>
          </DialogHeader>
        </div>

        {step === 1 ? (
          <div className="grid gap-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Sneakyguy AI ( this will used in reply )"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Sneakyguy helps B2B companies discover and convert qualified leads from Reddit discussions with AI powered monitoring and response generation."
                className="min-h-[100px] resize-none"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAnalyze} disabled={loading}>
                {loading ? 'Analyzing...' : 'Analyze & Continue'}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="grid gap-5 p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" opacity={0.7} />
                  <span>Keywords</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={loading || regenerateCount >= 2}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 h-auto font-normal"
                >
                  Regenerate
                  {regenerateCount > 0 && ` (${2 - regenerateCount} left)`}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5"
                  >
                    {keyword}
                    <span className="text-orange-400 cursor-pointer select-none">×</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4" opacity={0.7} />
                <span>Subreddits to Monitor</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {subreddits.map((subreddit) => (
                  <div
                    key={subreddit}
                    className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5"
                  >
                    r/{subreddit}
                    <span className="text-orange-400 cursor-pointer select-none">×</span>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}