'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, Project, ProjectInstructions } from '@/lib/api';
import { SubredditBadge } from '@/components/mentions/SubredditBadge';
import { useSubredditRules } from '@/lib/useSubredditRules';

const INSTRUCTIONS_MAX = 1500;

type InstructionFields = Pick<ProjectInstructions, 'scoring_instructions' | 'reply_instructions'>;

function InstructionField({
  id, label, help, placeholder, value, onChange, disabled,
}: {
  id: string; label: string; help: string; placeholder: string; value: string;
  onChange: (v: string) => void; disabled?: boolean;
}) {
  const near = value.length > INSTRUCTIONS_MAX * 0.9;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[12.5px] font-semibold text-gray-700">{label}</label>
        <span
          className={`text-[11px] tabular-nums ${near ? 'font-semibold text-[#b45309]' : 'text-gray-400'}`}
          aria-live="polite"
        >
          {value.length.toLocaleString()} / {INSTRUCTIONS_MAX.toLocaleString()}
        </span>
      </div>
      <p id={`${id}-help`} className="text-[11.5px] leading-snug text-gray-400">{help}</p>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, INSTRUCTIONS_MAX))}
        maxLength={INSTRUCTIONS_MAX}
        disabled={disabled}
        aria-describedby={`${id}-help`}
        placeholder={placeholder}
        rows={4}
        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm leading-relaxed placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff4500]/30 focus:border-gray-300 transition-[border-color,box-shadow] resize-y disabled:opacity-50"
      />
    </div>
  );
}

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
  const [instructions, setInstructions] = useState<InstructionFields>({ scoring_instructions: '', reply_instructions: '' });
  const [savedInstructions, setSavedInstructions] = useState<InstructionFields | null>(null);
  const [instructionsError, setInstructionsError] = useState<string | null>(null);
  const rulesFor = useSubredditRules(open ? subreddits : []);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setKeywords(project.keywords);
      setSubreddits(project.subreddits.map(s => s.replace(/^r\//, '')));
      setNewKeyword('');
      setNewSubreddit('');
    }
  }, [project, open]);

  useEffect(() => {
    if (!open || !project) return;
    let cancelled = false;
    setSavedInstructions(null);
    setInstructionsError(null);
    api.getInstructions(project.id)
      .then((r) => {
        if (cancelled) return;
        const fields = { scoring_instructions: r.scoring_instructions, reply_instructions: r.reply_instructions };
        setInstructions(fields);
        setSavedInstructions(fields);
      })
      .catch(() => { if (!cancelled) setInstructionsError('Could not load your instructions. Close this and open it again to retry.'); });
    return () => { cancelled = true; };
  }, [project, open]);

  const handleSave = async () => {
    if (!project) return;

    setIsSaving(true);
    try {
      if (
        savedInstructions &&
        (instructions.scoring_instructions !== savedInstructions.scoring_instructions ||
          instructions.reply_instructions !== savedInstructions.reply_instructions)
      ) {
        try {
          await api.saveInstructions(project.id, instructions);
          setSavedInstructions(instructions);
        } catch (e) {
          toast.error('Could not save your instructions', {
            description: e instanceof Error ? e.message : 'Check your connection and try again.',
          });
          return;
        }
      }
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
      <DialogContent className="max-w-[90vw] sm:max-w-lg overflow-y-auto max-h-[85vh] p-0 bg-white rounded-xl border border-gray-200 shadow-xl gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 tracking-tight">Edit project</h2>
          <p className="text-xs text-gray-400 mt-0.5">Update your project settings and targeting.</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[12.5px] font-semibold text-gray-700">
              Project name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              placeholder="Enter project name"
              className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow] disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[12.5px] font-semibold text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              placeholder="Describe your project's purpose and goals"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow] resize-none disabled:opacity-50"
            />
          </div>

          {/* Keywords */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] font-semibold text-gray-700">
                Keywords
              </label>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded tabular-nums">
                {keywords.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
              {keywords.map((keyword, index) => (
                <span
                  key={`${keyword}-${index}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    disabled={isSaving}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {keywords.length === 0 && (
                <span className="text-xs text-gray-300">No keywords added yet</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                disabled={isSaving}
                className="flex-1 h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow] disabled:opacity-50"
              />
              <button
                onClick={handleAddKeyword}
                disabled={isSaving || !newKeyword.trim()}
                className="h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>

          {/* Subreddits */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] font-semibold text-gray-700">
                Subreddits
              </label>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded tabular-nums">
                {subreddits.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
              {subreddits.map((subreddit, index) => (
                <span
                  key={`${subreddit}-${index}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50/60 border border-blue-100/50 text-xs font-medium text-blue-600"
                >
                  r/{subreddit}
                  <SubredditBadge rules={rulesFor(subreddit)} />
                  <button
                    onClick={() => handleRemoveSubreddit(subreddit)}
                    disabled={isSaving}
                    className="text-blue-300 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {subreddits.length === 0 && (
                <span className="text-xs text-gray-300">No subreddits added yet</span>
              )}
            </div>
            {subreddits.length > 0 && (
              <p className="text-[11.5px] leading-snug text-gray-400">
                Strict subs remove self-promotion, careful ones allow it with conditions. Click a badge for the rule.
              </p>
            )}
            <div className="flex gap-2">
              <input
                value={newSubreddit}
                onChange={(e) => setNewSubreddit(e.target.value)}
                placeholder="Add subreddit..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubreddit())}
                disabled={isSaving}
                className="flex-1 h-9 px-3 rounded-lg border border-gray-200 bg-white text-xs placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow] disabled:opacity-50"
              />
              <button
                onClick={handleAddSubreddit}
                disabled={isSaving || !newSubreddit.trim()}
                className="h-9 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Custom instructions */}
        <div className="px-6 pb-6 space-y-5">
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold text-gray-900">Custom instructions</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Plain-language rules for this project. Your tone and style note in Settings still apply to every project.
            </p>
            {instructionsError && (
              <p role="alert" className="mt-2 text-xs font-medium text-[#b83200]">{instructionsError}</p>
            )}
          </div>
          <InstructionField
            id="scoring-instructions"
            label="How to score leads"
            help="Used when each new post is scored. Say who counts as a good lead and who does not."
            placeholder="Example: Only B2B SaaS founders or heads of sales count. Ignore students, job seekers and people who want a free tool."
            value={instructions.scoring_instructions}
            onChange={(v) => setInstructions((cur) => ({ ...cur, scoring_instructions: v }))}
            disabled={isSaving || !savedInstructions}
          />
          <InstructionField
            id="reply-instructions"
            label="How to write replies"
            help="Used for reply and DM drafts. Say what to stress, what to avoid, and how you talk."
            placeholder="Example: Write like a founder, not a marketer. Mention the free plan only if they ask about price. Never name competitors."
            value={instructions.reply_instructions}
            onChange={(v) => setInstructions((cur) => ({ ...cur, reply_instructions: v }))}
            disabled={isSaving || !savedInstructions}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="flex-1 h-10 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="flex-1 h-10 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-[background-color,box-shadow] shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
