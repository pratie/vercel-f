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
      <DialogContent className="max-w-[95vw] sm:max-w-2xl overflow-y-auto max-h-[85vh] p-4 sm:p-6">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl">Edit Project</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Customize your project settings to improve lead generation accuracy.
          </p>
        </DialogHeader>

        <div className="grid gap-4 sm:gap-6 py-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                className="h-10 sm:h-9"
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background h-24 sm:h-20 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Describe your project's purpose and goals"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:gap-6 p-3 sm:p-4 bg-muted/50 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Keywords</Label>
                <span className="text-xs text-muted-foreground">{keywords.length} keywords added</span>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                {keywords.map((keyword, index) => (
                  <div
                    key={`${keyword}-${index}`}
                    className="inline-flex items-center gap-1.5 bg-background hover:bg-accent text-sm px-2.5 py-1.5 rounded-md transition-colors group"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      disabled={isSaving}
                      className="opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity p-0.5"
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
                  className="h-10 sm:h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddKeyword}
                  disabled={isSaving}
                  className="px-4 h-10 sm:h-9 whitespace-nowrap"
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Subreddits to Monitor</Label>
                <span className="text-xs text-muted-foreground">{subreddits.length} subreddits added</span>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                {subreddits.map((subreddit, index) => (
                  <div
                    key={`${subreddit}-${index}`}
                    className="inline-flex items-center gap-1.5 bg-background hover:bg-accent text-sm px-2.5 py-1.5 rounded-md transition-colors group"
                  >
                    <span className="text-[#ff4500]">r/{subreddit}</span>
                    <button
                      onClick={() => handleRemoveSubreddit(subreddit)}
                      disabled={isSaving}
                      className="opacity-50 hover:opacity-100 focus:opacity-100 transition-opacity p-0.5"
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
                  className="h-10 sm:h-9 text-sm"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSubreddit}
                  disabled={isSaving}
                  className="px-4 h-10 sm:h-9 whitespace-nowrap"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSaving}
            className="h-11 sm:h-9"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-11 sm:h-9"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
