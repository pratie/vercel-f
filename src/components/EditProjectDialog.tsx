'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

interface Project {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  subreddits: string[];
}

interface EditProjectDialogProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectId: string, updatedData: Partial<Project>) => Promise<void>;
}

export function EditProjectDialog({ project, isOpen, onClose, onSave }: EditProjectDialogProps) {
  const [keywords, setKeywords] = useState<string[]>(project?.keywords ?? []);
  const [subreddits, setSubreddits] = useState<string[]>(project?.subreddits ?? []);
  const [newKeyword, setNewKeyword] = useState('');
  const [newSubreddit, setNewSubreddit] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setKeywords(project.keywords);
      // Ensure subreddits are stored without 'r/' prefix
      setSubreddits(project.subreddits.map(s => s.replace(/^r\//, '')));
      setNewKeyword('');
      setNewSubreddit('');
    }
  }, [project]);

  const handleSave = async () => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      await onSave(project.id, {
        name,
        description,
        keywords,
        subreddits: subreddits.map(s => `r/${s}`),
      });
      
      toast.success('Project updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update project:', error);
      toast.error('Failed to update project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleAddSubreddit = () => {
    const formatted = newSubreddit.trim().replace(/^r\//, '');
    if (formatted && !subreddits.includes(formatted)) {
      setSubreddits([...subreddits, formatted]);
      setNewSubreddit('');
    }
  };

  const handleRemoveSubreddit = (subredditToRemove: string) => {
    setSubreddits(subreddits.filter(s => s !== subredditToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] sm:max-w-xl overflow-y-auto max-h-[85vh] p-3 sm:p-4 bg-white shadow-lg rounded-xl">
        <DialogHeader className="space-y-1.5 sm:space-y-2 border-b border-gray-200/80 pb-3">
          <DialogTitle className="text-base sm:text-lg font-semibold text-gray-900">Edit Project</DialogTitle>
          <p className="text-xs sm:text-sm text-gray-500">
            Customize your project settings to improve lead generation accuracy.
          </p>
        </DialogHeader>

        <div className="grid gap-3 sm:gap-4 py-3">
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                className="h-9 bg-white border-gray-200 focus:border-gray-300 focus:ring-gray-100 shadow-sm text-sm"
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white h-20 resize-none focus:border-gray-300 focus:ring-gray-100 shadow-sm"
                placeholder="Describe your project's purpose and goals"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 p-3 bg-gray-50/40 rounded-lg border border-gray-200/80">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Keywords</Label>
                <span className="text-xs text-gray-500 bg-white/80 px-1.5 py-0.5 rounded border border-gray-200/80">
                  {keywords.length} keywords
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[2.5rem]">
                {keywords.map((keyword, index) => (
                  <div
                    key={`${keyword}-${index}`}
                    className="inline-flex items-center gap-1 bg-white text-sm px-2 py-1 rounded border border-gray-200/80 hover:border-gray-300"
                  >
                    <span className="text-gray-700">{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      disabled={isSaving}
                      className="text-gray-400 hover:text-gray-600 focus:text-gray-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Type keyword and press Enter"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                  disabled={isSaving}
                  className="h-8 text-sm bg-white border-gray-200 focus:border-gray-300 focus:ring-gray-100 shadow-sm"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddKeyword}
                  disabled={isSaving}
                  className="px-3 h-8 whitespace-nowrap bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm text-sm"
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">Subreddits to Monitor</Label>
                <span className="text-xs text-gray-500 bg-white/80 px-1.5 py-0.5 rounded border border-gray-200/80">
                  {subreddits.length} subreddits
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 min-h-[2.5rem]">
                {subreddits.map((subreddit, index) => (
                  <div
                    key={`${subreddit}-${index}`}
                    className="inline-flex items-center gap-1 bg-white text-sm px-2 py-1 rounded border border-gray-200/80 hover:border-gray-300"
                  >
                    <span className="text-gray-900 font-medium">r/{subreddit}</span>
                    <button
                      onClick={() => handleRemoveSubreddit(subreddit)}
                      disabled={isSaving}
                      className="text-gray-400 hover:text-gray-600 focus:text-gray-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSubreddit}
                  onChange={(e) => setNewSubreddit(e.target.value)}
                  placeholder="Type subreddit name and press Enter"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubreddit()}
                  disabled={isSaving}
                  className="h-8 text-sm bg-white border-gray-200 focus:border-gray-300 focus:ring-gray-100 shadow-sm"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSubreddit}
                  disabled={isSaving}
                  className="px-3 h-8 whitespace-nowrap bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 shadow-sm text-sm"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-3 border-t border-gray-200/80">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSaving}
            className="h-9 border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm text-sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-9 bg-[#ff4500] hover:bg-[#ff4500]/90 text-white shadow-sm text-sm font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
