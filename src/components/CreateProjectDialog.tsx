// src/components/CreateProjectDialog.tsx
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Loader2, Sparkles, RefreshCw, X, Globe, ArrowRight, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; description: string; keywords: string[]; subreddits: string[] }) => Promise<void>;
  initialUrl?: string;
}

export function CreateProjectDialog({ open, onOpenChange, onSubmit, initialUrl }: CreateProjectDialogProps) {
  const [step, setStep] = useState<'url' | 'review'>('url');
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [subreddits, setSubreddits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [editingInfo, setEditingInfo] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep('url');
      setUrl('');
      setName('');
      setDescription('');
      setKeywords([]);
      setSubreddits([]);
      setLoading(false);
      setRegenerateCount(0);
      setEditingInfo(false);
      setShowManual(false);
    }
  }, [open]);

  // If opened with a pre-filled URL, auto-analyze
  useEffect(() => {
    if (open && initialUrl) {
      setUrl(initialUrl);
      handleAnalyzeUrl(initialUrl);
    }
  }, [open, initialUrl]);

  const handleAnalyzeUrl = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || url;
    if (!targetUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const result = await api.analyzeUrl(targetUrl.trim());
      setName(result.name);
      setDescription(result.description);
      setKeywords(result.keywords);
      setSubreddits(result.subreddits.map(s => s.replace(/^r\//, '')));
      setStep('review');
    } catch (error: any) {
      console.error('URL analysis error:', error);
      toast.error(error?.message || 'Failed to analyze URL. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalyze = async () => {
    if (!name || !description) {
      toast.error('Please enter both name and description');
      return;
    }
    if (description.length < 10) {
      toast.error('Description should be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      const analysis = await api.analyzeInitial({ name, description });
      setKeywords(analysis.keywords);
      setSubreddits(analysis.subreddits.map(s => s.replace(/^r\//, '')));
      setShowManual(false);
      setStep('review');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze. Please try again.');
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
      const analysis = await api.analyzeInitial({ name, description });
      setKeywords(analysis.keywords);
      setSubreddits(analysis.subreddits.map(s => s.replace(/^r\//, '')));
      setRegenerateCount(prev => prev + 1);
      toast.success('Regenerated successfully');
    } catch (error) {
      console.error('Regeneration error:', error);
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

  const handleRemoveKeyword = (kw: string) => setKeywords(keywords.filter(k => k !== kw));
  const handleRemoveSubreddit = (sr: string) => setSubreddits(subreddits.filter(s => s !== sr));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-lg overflow-y-auto max-h-[85vh] p-0 bg-white rounded-xl border border-gray-200 shadow-xl gap-0">

        {step === 'url' && !loading ? (
          <>
            {/* URL Step */}
            <div className="px-6 pt-6 pb-4">
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">Add a new project</h2>
              <p className="text-xs text-gray-400 mt-0.5">Paste your website URL and we'll do the rest.</p>
            </div>

            <div className="px-6 pb-6 space-y-4">
              {/* URL Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeUrl()}
                    placeholder="https://yourproduct.com"
                    autoFocus
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow]"
                  />
                </div>
              </div>

              <button
                onClick={() => handleAnalyzeUrl()}
                disabled={!url.trim()}
                className="w-full h-11 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-[background-color,box-shadow] shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Analyze & Generate
              </button>

              {/* Manual fallback */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center">
                  <button
                    onClick={() => setShowManual(!showManual)}
                    className="bg-white px-3 text-[11px] text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                  >
                    or enter manually
                    {showManual ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                </div>
              </div>

              {showManual && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Project Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Sneakyguy AI"
                      className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what your product does and who it's for..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow] resize-none"
                    />
                  </div>
                  <button
                    onClick={handleManualAnalyze}
                    disabled={!name.trim() || !description.trim()}
                    className="w-full h-10 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-[background-color] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Generate Keywords
                  </button>
                </div>
              )}
            </div>
          </>
        ) : step === 'url' && loading ? (
          /* Loading state */
          <div className="px-6 py-16 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Analyzing your website</p>
              <p className="text-xs text-gray-400 mt-1">Scraping content, extracting brand info, generating keywords...</p>
            </div>
            <div className="flex gap-1 mt-2">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse"
                  style={{ animationDelay: `${i * 200}ms` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Review Step */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 tracking-tight">Review & Create</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Everything was auto-generated. Edit anything before creating.</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Brand Info */}
              <div className="space-y-3">
                {editingInfo ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-[border-color,box-shadow] resize-none"
                      />
                    </div>
                    <button
                      onClick={() => setEditingInfo(false)}
                      className="text-[11px] font-medium text-gray-900 hover:underline"
                    >
                      Done editing
                    </button>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{description}</p>
                      </div>
                      <button
                        onClick={() => setEditingInfo(true)}
                        className="shrink-0 p-1.5 rounded-md hover:bg-white text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Keywords */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Keywords <span className="text-gray-300 font-normal normal-case tabular-nums">({keywords.length})</span>
                  </label>
                  <button
                    onClick={handleRegenerate}
                    disabled={loading || regenerateCount >= 2}
                    className="flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span className="tabular-nums">Regenerate{regenerateCount > 0 ? ` (${2 - regenerateCount})` : ''}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-50 border border-gray-100 text-xs font-medium text-gray-700"
                    >
                      {keyword}
                      <button onClick={() => handleRemoveKeyword(keyword)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Subreddits */}
              <div className="space-y-2.5">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Subreddits <span className="text-gray-300 font-normal normal-case tabular-nums">({subreddits.length})</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {subreddits.map((subreddit) => (
                    <span
                      key={subreddit}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50/60 border border-blue-100/50 text-xs font-medium text-blue-600"
                    >
                      r/{subreddit}
                      <button onClick={() => handleRemoveSubreddit(subreddit)} className="text-blue-300 hover:text-red-400 transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                  <span className="text-xs text-gray-400">Regenerating...</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => { setStep('url'); setEditingInfo(false); }}
                  disabled={loading}
                  className="flex-1 h-10 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || keywords.length === 0 || !name.trim()}
                  className="flex-1 h-10 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-[background-color,box-shadow] shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Project
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
