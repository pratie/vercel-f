'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Pencil, Tag, Hash, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { Project } from '@/lib/api';

interface EditProjectDialogProps {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedProject: Project) => Promise<void>;
}

export function EditProjectDialog({ project, open, onOpenChange, onSave }: EditProjectDialogProps) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newSubreddit, setNewSubreddit] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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
  }, [project, open]);

  const handleSave = async () => {
    if (!project) return;
    
    setIsSaving(true);
    try {
      const updatedProject = {
        ...project,
        name,
        description,
        keywords,
        subreddits: subreddits.map(s => s.startsWith('r/') ? s : `r/${s}`),
      };
      
      await onSave(updatedProject);
      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-xl overflow-y-auto max-h-[85vh] p-0 bg-white shadow-lg rounded-xl">
        <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-4 rounded-t-xl">
          <DialogHeader className="space-y-1.5 text-white">
            <DialogTitle className="text-xl font-bold flex items-center">
              <Pencil className="h-5 w-5 mr-2" />
              Edit Project
            </DialogTitle>
            <p className="text-sm text-white/90">
              Customize your project settings to improve lead generation accuracy.
            </p>
          </DialogHeader>
        </div>

        <div className="grid gap-5 p-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center text-gray-700">
                <Tag className="h-4 w-4 mr-1.5 text-[hsl(var(--primary))]" />
                Project Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                className="h-10 bg-white border-gray-200 focus:border-[hsl(var(--primary))]/50 focus:ring-[hsl(var(--accent))]/30 shadow-sm text-sm"
                placeholder="Enter project name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium flex items-center text-gray-700">
                <MessageSquare className="h-4 w-4 mr-1.5 text-[hsl(var(--primary))]" />
                Description
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white h-24 resize-none focus:border-[hsl(var(--primary))]/50 focus:ring-[hsl(var(--accent))]/30 shadow-sm"
                placeholder="Describe your project's purpose and goals"
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center text-gray-700">
                  <Hash className="h-4 w-4 mr-1.5 text-[hsl(var(--primary))]" />
                  Keywords
                </Label>
                <span className="text-xs text-white bg-[hsl(var(--primary))] px-2 py-0.5 rounded-full">
                  {keywords.length} keywords
                </span>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 bg-gray-50 rounded-lg border border-gray-100">
                {keywords.map((keyword, index) => (
                  <div
                    key={`${keyword}-${index}`}
                    className="inline-flex items-center gap-1.5 bg-white text-sm px-2.5 py-1 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-gray-800">{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(keyword)}
                      disabled={isSaving}
                      className="text-gray-400 hover:text-red-500 focus:text-red-500 transition-colors"
                      aria-label={`Remove ${keyword}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {keywords.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No keywords added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Type keyword and press Enter"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  disabled={isSaving}
                  className="h-9 text-sm bg-white border-gray-200 focus:border-[hsl(var(--primary))]/50 focus:ring-[hsl(var(--accent))]/30 shadow-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddKeyword}
                  disabled={isSaving || !newKeyword.trim()}
                  className="h-9 whitespace-nowrap bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 text-[hsl(var(--primary))] border-none shadow-sm text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center text-gray-700">
                  <MessageSquare className="h-4 w-4 mr-1.5 text-[hsl(var(--primary))]" />
                  Subreddits to Monitor
                </Label>
                <span className="text-xs text-white bg-[hsl(var(--primary))] px-2 py-0.5 rounded-full">
                  {subreddits.length} subreddits
                </span>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 bg-gray-50 rounded-lg border border-gray-100">
                {subreddits.map((subreddit, index) => (
                  <div
                    key={`${subreddit}-${index}`}
                    className="inline-flex items-center gap-1.5 bg-white text-sm px-2.5 py-1 rounded-full border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span className="text-blue-600 font-medium">r/{subreddit}</span>
                    <button
                      onClick={() => handleRemoveSubreddit(subreddit)}
                      disabled={isSaving}
                      className="text-gray-400 hover:text-red-500 focus:text-red-500 transition-colors"
                      aria-label={`Remove r/${subreddit}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {subreddits.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No subreddits added yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSubreddit}
                  onChange={(e) => setNewSubreddit(e.target.value)}
                  placeholder="Type subreddit name and press Enter"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubreddit())}
                  disabled={isSaving}
                  className="h-9 text-sm bg-white border-gray-200 focus:border-[hsl(var(--primary))]/50 focus:ring-[hsl(var(--accent))]/30 shadow-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddSubreddit}
                  disabled={isSaving || !newSubreddit.trim()}
                  className="h-9 whitespace-nowrap bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))]/80 text-[hsl(var(--primary))] border-none shadow-sm text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 p-4 pt-2 border-t border-gray-100 bg-gray-50/50">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={isSaving}
            className="h-10 border-gray-200 hover:bg-gray-50 text-gray-700 shadow-sm text-sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !name.trim()}
            className="h-10 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white shadow-sm text-sm font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
