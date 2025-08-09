'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, ArrowRight, Search, LayoutGrid, Rows, SortDesc, Sparkles } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Toaster, toast } from 'sonner';
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
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Redirect unpaid users directly to upgrade page
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
      setPaymentStatusChecked(true); // Mark as checked even on error to prevent infinite loading
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
      setProjects(prevProjects => [...prevProjects, newProject]);
      toast.success('Project created successfully!');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setProjects(prevProjects => prevProjects.filter(p => p.id !== projectId));
      await api.deleteProject(projectId);
      toast.success('Project deleted successfully');
      
      // Clear cached mentions for the deleted project
      const mentionsCacheKey = `mentions-${projectId}`;
      localStorage.removeItem(mentionsCacheKey);
      console.log(`Cleared mentions cache for project ${projectId}: ${mentionsCacheKey}`);

    } catch (error) {
      console.error('Delete project error:', error);
      loadProjects();
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const handleNewProject = async () => {
    if (!hasPaid) {
      // Redirect to upgrade page to show all pricing options
      router.push('/upgrade');
      return;
    }
    setIsCreateOpen(true);
  };

  // Derived UI state
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
      // recent: assume newer first by created_at if available, else fallback to name
      const ad = (a as any).created_at || 0;
      const bd = (b as any).created_at || 0;
      if (ad && bd) return bd - ad;
      return b.name.localeCompare(a.name);
    });

  return (
    <div className="relative">
      {/* Background gradient for depth */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-gray-50" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 size-[520px] rounded-full bg-[hsl(var(--primary))]/10 blur-3xl opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
              <Sparkles className="h-4 w-4" />
            </span>
            <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900 tracking-tight">Your Projects</h1>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, keywords..."
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))]/40"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'name')}
                  className="appearance-none pl-9 pr-8 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))]/40"
                >
                  <option value="recent">Sort: Recent</option>
                  <option value="name">Sort: Name</option>
                </select>
                <SortDesc className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              {/* View toggle */}
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${view === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm transition-colors ${view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                  aria-label="List view"
                >
                  <Rows className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => hasPaid ? setIsCreateOpen(true) : handleNewProject()}
                className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                {hasPaid ? (
                  <>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                      <Plus className="h-4 w-4" />
                    </span>
                    New Project
                  </>
                ) : (
                  <>
                    Upgrade to Add Projects
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {(isLoading || !paymentStatusChecked || isProcessingPayment) ? (
          <div className="min-h-[50vh]">
            {/* Subtle loader with skeletons */}
            <div className="flex items-center gap-3 mb-6 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin text-[hsl(var(--primary))]" />
              <p>{isProcessingPayment ? 'Processing payment...' : (paymentStatusChecked && !hasPaid ? 'Redirecting to upgrade page...' : 'Loading projects...')}</p>
            </div>
            <div className={`grid ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
              {Array.from({ length: view === 'grid' ? 6 : 4 }).map((_, i) => (
                <div key={i} className={`rounded-xl border border-gray-200 bg-white p-5 ${view === 'list' ? 'flex items-start gap-4' : ''}`}>
                  <div className="h-5 w-40 bg-gray-100 rounded mb-3" />
                  <div className="h-4 w-full bg-gray-100 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          </div>
      ) : !hasPaid ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
          <p className="ml-3 text-gray-600">Redirecting to upgrade page...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[380px] space-y-3 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
            <Search className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold">No matching projects</h2>
          <p className="text-gray-600 max-w-md">
            Try a different search or clear filters to see all your projects.
          </p>
          {projects.length === 0 && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90 text-white mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          )}
        </div>
      ) : (
        <div className={`grid ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {filtered.map((project) => (
            <div key={project.id} className={`${view === 'list' ? 'transition-all hover:translate-y-[-1px]' : ''}`}>
              <ProjectCard
                project={project}
                onDelete={handleDeleteProject}
              />
            </div>
          ))}
        </div>
      )}

        <CreateProjectDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreateProject}
        />
        <Toaster position="top-center" />
        {/* Only show FreeAccessMessage for unpaid users */}
        {paymentStatusChecked && !hasPaid && <FreeAccessMessage />}
      </div>
    </div>
  );
}