// src/components/CreateProjectDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; keywords: string[]; subreddits: string[] }) => Promise<void>;
}

export function CreateProjectDialog({ open, onOpenChange, onSubmit }: CreateProjectDialogProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    keywords: [] as string[],
    subreddits: [] as string[]
  });

  // Reset state when dialog is opened/closed
  useEffect(() => {
    if (!open) {
      setStep(1);
      setProjectData({
        name: '',
        description: '',
        keywords: [],
        subreddits: []
      });
      setLoading(false);
      setAnalyzing(false);
    }
  }, [open]);

  const handleAnalyze = async () => {
    if (!projectData.name || !projectData.description) {
      toast.error('Please enter both project name and description');
      return;
    }
    if (projectData.description.length < 10) {
      toast.error('Description should be at least 10 characters long');
      return;
    }

    setAnalyzing(true);
    try {
      const analysis = await api.analyzeInitial({
        name: projectData.name,
        description: projectData.description
      });

      setProjectData(prev => ({
        ...prev,
        keywords: analysis.keywords,
        subreddits: analysis.subreddits
      }));
      setStep(2);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze project. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(projectData);
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Project Name</label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                disabled={analyzing}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">Description</label>
              <Textarea
                id="description"
                placeholder="Describe your project (min. 10 characters)"
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                className="min-h-[100px]"
                disabled={analyzing}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze & Continue'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {projectData.keywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-sm"
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Subreddits</h3>
              <div className="flex flex-wrap gap-2">
                {projectData.subreddits.map((subreddit) => (
                  <div
                    key={subreddit}
                    className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-sm"
                  >
                    {subreddit}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Start Tracking'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}