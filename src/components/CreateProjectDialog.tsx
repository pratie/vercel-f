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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Project</DialogTitle>
          {step === 2 && (
            <p className="text-sm text-gray-500 mt-1">
              Review and confirm your project's targeting
            </p>
          )}
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Project Name</label>
              <Input
                id="name"
                placeholder="Enter project name"
                value={projectData.name}
                onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                disabled={analyzing}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
              <Textarea
                id="description"
                placeholder="Describe your project (min. 10 characters)"
                value={projectData.description}
                onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                className="min-h-[120px] w-full"
                disabled={analyzing}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="px-4"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAnalyze} 
                disabled={analyzing}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4"
              >
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
          <div className="space-y-6 py-4">
            {/* Keywords Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Keywords</h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                    {projectData.keywords.length}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-700 h-8"
                >
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-gray-50/50 p-3 sm:p-4 rounded-lg border border-gray-100">
                {projectData.keywords.map((keyword) => (
                  <div
                    key={keyword}
                    className="bg-white px-3 py-2 rounded-md text-sm border border-gray-200 shadow-sm hover:shadow transition-all overflow-hidden text-ellipsis whitespace-nowrap flex items-center"
                  >
                    <span className="overflow-hidden text-ellipsis font-medium text-gray-700">{keyword}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subreddits Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900">Subreddits</h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                    {projectData.subreddits.length}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-gray-700 h-8"
                >
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-gray-50/50 p-3 sm:p-4 rounded-lg border border-gray-100">
                {projectData.subreddits.map((subreddit) => (
                  <div
                    key={subreddit}
                    className="bg-white px-3 py-2 rounded-md text-sm border border-gray-200 shadow-sm hover:shadow transition-all overflow-hidden text-ellipsis whitespace-nowrap flex items-center gap-1.5"
                  >
                    <span className="text-teal-500 font-medium">r/</span>
                    <span className="overflow-hidden text-ellipsis font-medium text-gray-700">{subreddit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="w-full sm:w-auto"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="bg-teal-500 hover:bg-teal-600 text-white w-full sm:w-auto"
              >
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