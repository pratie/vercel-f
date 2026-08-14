'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, ArrowRight, Search, LayoutGrid, Rows, Globe, Sparkles } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { toast } from 'sonner';
import { api, Project } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { FreeAccessMessage } from '../components/FreeAccessMessage';


export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentStatusChecked, setPaymentStatusChecked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [urlInput, setUrlInput] = useState('');
  const [pendingUrl, setPendingUrl] = useState<string | undefined>();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pick up pending URL from landing page
  useEffect(() => {
    if (hasPaid && paymentStatusChecked && !isLoading) {
      const analyze = searchParams.get('analyze');
      const pendingFromLanding = typeof window !== 'undefined' ? sessionStorage.getItem('pending_analyze_url') : null;
      if (analyze === 'true' && pendingFromLanding) {
        sessionStorage.removeItem('pending_analyze_url');
        setPendingUrl(pendingFromLanding);
        setIsCreateOpen(true);
      }
    }
  }, [hasPaid, paymentStatusChecked, isLoading, searchParams]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const handlePaymentSuccess = async () => {
      const isPaymentSuccess = searchParams.get('payment') === 'success' ||
                              searchParams.get('status') === 'succeeded';
      const paymentId = searchParams.get('payment_id');

      if (isPaymentSuccess && !hasPaid) {
        setIsProcessingPayment(true);
        try {
          await api.updatePaymentStatus(paymentId ? { paymentId } : undefined);
          sessionStorage.removeItem('payment-status-v1');
          setHasPaid(true);
          toast.success('Payment successful! You can now create projects.');
        } catch (error) {
          console.error('Error updating payment status:', error);
          toast.error('Error processing payment. Please contact support.');
        } finally {
          setIsProcessingPayment(false);
        }
      }
    };

    loadProjects();
    checkPaymentStatus();
    handlePaymentSuccess();
  }, [user, router, searchParams, hasPaid]);

  useEffect(() => {
    if (user && paymentStatusChecked && hasPaid === false && !isLoading && !isProcessingPayment) {
      router.push('/upgrade');
    }
  }, [user, paymentStatusChecked, hasPaid, isLoading, isProcessingPayment, router]);

  const checkPaymentStatus = async () => {
    try {
      const status = await api.getPaymentStatus();
      setHasPaid(status.has_paid);
      setPaymentStatusChecked(true);
    } catch (error) {
      console.error('Failed to check payment status:', error);
      setPaymentStatusChecked(true);
    }
  };

  const loadProjects = async () => {
    try {
      const fetchedProjects = await api.getProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('Failed to load projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (projectData: {
    name: string;
    description: string;
    keywords: string[];
    subreddits: string[];
  }) => {
    if (!hasPaid) {
      handleNewProject();
      return;
    }

    try {
      const newProject = await api.createProject({
        name: projectData.name,
        description: projectData.description,
        keywords: projectData.keywords,
        subreddits: projectData.subreddits.map(s => s.replace(/^r\//, '')),
      });
      setProjects(prevProjects => {
        const next = [...prevProjects, newProject];
        window.dispatchEvent(new CustomEvent('sneakyguy:projects-updated', { detail: next }));
        return next;
      });
      toast.success('Project created successfully!');
    } catch (error: any) {
      console.error('Failed to create project:', error);
      if (error?.statusCode === 402) {
        toast.error(error.message || 'Your subscription has expired. Please renew to continue.');
        sessionStorage.removeItem('payment-status-v1');
        router.push('/upgrade');
      } else {
        toast.error(error?.message || 'Failed to create project. Please try again.');
      }
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setProjects(prevProjects => {
        const next = prevProjects.filter(p => p.id !== projectId);
        window.dispatchEvent(new CustomEvent('sneakyguy:projects-updated', { detail: next }));
        return next;
      });
      await api.deleteProject(projectId);
      toast.success('Project deleted successfully');

      const mentionsCacheKey = `mentions-${projectId}`;
      localStorage.removeItem(mentionsCacheKey);
    } catch (error) {
      console.error('Delete project error:', error);
      loadProjects();
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const handleNewProject = async () => {
    if (!hasPaid) {
      router.push('/upgrade');
      return;
    }
    setPendingUrl(undefined);
    setIsCreateOpen(true);
  };

  const handleUrlSubmit = () => {
    if (!hasPaid) {
      router.push('/upgrade');
      return;
    }
    if (!urlInput.trim()) return;
    setPendingUrl(urlInput.trim());
    setIsCreateOpen(true);
    setUrlInput('');
  };

  const filtered = projects
    .filter(p => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.keywords || []).join(' ').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      const ad = (a as any).created_at || 0;
      const bd = (b as any).created_at || 0;
      if (ad && bd) return bd - ad;
      return b.name.localeCompare(a.name);
    });

  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto py-2">
        {/* URL Input Hero CTA */}
        {hasPaid && paymentStatusChecked && !isLoading && (
          <div className="mb-8">
            <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-[box-shadow] duration-300 ease-out" style={{ WebkitFontSmoothing: 'antialiased' } as any}>
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300" aria-hidden="true" />
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-orange-50 blur-2xl opacity-70 pointer-events-none" aria-hidden="true" />
              <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-ink-900 mb-0.5" style={{ textWrap: 'balance' } as any}>Start monitoring a new brand</h2>
                  <p className="text-xs text-ink-400" style={{ textWrap: 'pretty' } as any}>Paste any website URL — we'll extract brand info and generate keywords automatically.</p>
                </div>
              </div>
              <div className="relative mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-300" />
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    placeholder="https://yourproduct.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#e9e1d4] bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-300 transition-[border-color,box-shadow] duration-200"
                  />
                </div>
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className="btn-primary h-11 px-5 disabled:cursor-not-allowed shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Analyze</span>
                </button>
              </div>
              <div className="relative mt-2.5 flex items-center gap-3">
                <span className="text-[10px] text-ink-300">or</span>
                <button
                  onClick={handleNewProject}
                  className="text-[11px] font-medium text-ink-400 hover:text-ink-600 transition-colors duration-150"
                >
                  enter details manually
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-ink-900 tracking-tight" style={{ WebkitFontSmoothing: 'antialiased' } as any}>Projects</h1>
              <p className="text-sm text-ink-400 mt-0.5" style={{ textWrap: 'pretty' } as any}>Manage your Reddit monitoring projects</p>
            </div>
            {!hasPaid && paymentStatusChecked && (
              <button
                onClick={handleNewProject}
                className="btn-primary h-9 px-4 text-xs"
              >
                Upgrade
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Controls */}
          {projects.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-9 pr-3 h-9 rounded-xl border border-[#e9e1d4] bg-white text-xs text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-300 transition-[border-color,box-shadow] duration-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'name')}
                  className="h-9 px-3 rounded-xl border border-[#e9e1d4] bg-white text-xs text-ink-600 focus:outline-none focus:ring-2 focus:ring-orange-400/30"
                >
                  <option value="recent">Recent</option>
                  <option value="name">Name</option>
                </select>

                <div className="inline-flex rounded-xl border border-[#e9e1d4] bg-white p-0.5">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-1.5 rounded-lg transition-colors duration-150 ${view === 'grid' ? 'bg-cream text-ink-900' : 'text-ink-400 hover:text-ink-600'}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-1.5 rounded-lg transition-colors duration-150 ${view === 'list' ? 'bg-cream text-ink-900' : 'text-ink-400 hover:text-ink-600'}`}
                  >
                    <Rows className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {(isLoading || !paymentStatusChecked || isProcessingPayment) ? (
          <div className="min-h-[40vh]">
            <div className="flex items-center gap-2 mb-6 text-sm text-ink-600">
              <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
              <p>{isProcessingPayment ? 'Processing payment...' : (paymentStatusChecked && !hasPaid ? 'Redirecting...' : 'Loading projects...')}</p>
            </div>
            <div className={`grid ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
              {Array.from({ length: view === 'grid' ? 6 : 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-white p-5 animate-pulse shadow-card">
                  <div className="h-4 w-32 bg-cream rounded-full mb-3" />
                  <div className="h-3 w-full bg-paper rounded-full mb-2" />
                  <div className="h-3 w-2/3 bg-paper rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ) : !hasPaid ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-5 w-5 animate-spin text-ink-400" />
            <p className="ml-2 text-sm text-ink-600">Redirecting...</p>
          </div>
        ) : filtered.length === 0 && projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[320px] text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 mb-4 shadow-card">
              <Globe className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-ink-900 mb-1.5">Create your first project</h2>
            <p className="text-sm text-ink-600 max-w-sm leading-relaxed mb-6">
              Paste your website and we&apos;ll read it, work out what you sell, and suggest the
              keywords and subreddits worth monitoring. You can edit everything before it saves.
            </p>
            <button
              onClick={handleNewProject}
              className="btn-primary h-10 px-5"
            >
              <Sparkles className="h-4 w-4" />
              Analyze a website
            </button>
            <p className="text-[11px] text-ink-400 mt-4">Takes about 20 seconds</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-ink-400 mb-3">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-semibold text-ink-900 mb-1">No results</h2>
            <p className="text-xs text-ink-400 max-w-xs">Try a different search term.</p>
          </div>
        ) : (
          <div className={`grid ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        <CreateProjectDialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setPendingUrl(undefined);
          }}
          onSubmit={handleCreateProject}
          initialUrl={pendingUrl}
        />
        {paymentStatusChecked && !hasPaid && <FreeAccessMessage />}
      </div>
    </div>
  );
}
