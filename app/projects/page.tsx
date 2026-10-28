'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Search, LayoutGrid, Rows, Globe, Sparkles } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { toast } from 'sonner';
import { api, Project, hasActiveAccess } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { FreeAccessMessage } from '../components/FreeAccessMessage';
import { BTN_PRIMARY, STICKER_PANEL } from '@/components/ui/sticker';


export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentStatusChecked, setPaymentStatusChecked] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [urlInput, setUrlInput] = useState('');
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Old links still say /projects?new=1. The wizard lives at /projects/new now.
  useEffect(() => {
    if (searchParams.get('new') === '1') router.replace('/projects/new');
  }, [searchParams, router]);

  // Pick up a pending URL from the landing page. Runs for unpaid users too:
  // the analysis itself is free, and seeing their own keywords is the moment
  // that sells the plan. The wizard reads the same sessionStorage key and
  // starts the analysis by itself; the key stays until a project is created,
  // so it survives the trip through the payment flow.
  useEffect(() => {
    if (!user) return;
    const pendingFromLanding = typeof window !== 'undefined' ? sessionStorage.getItem('pending_analyze_url') : null;
    if (pendingFromLanding) router.replace('/projects/new');
  }, [user, router]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const handlePaymentSuccess = async () => {
      const isPaymentSuccess = searchParams.get('payment') === 'success' ||
                              (searchParams.get('status') === 'succeeded' || searchParams.get('status') === 'active');
      const paymentId = searchParams.get('payment_id') || undefined;
      const subscriptionId = searchParams.get('subscription_id') || undefined;

      if (isPaymentSuccess && !hasPaid) {
        setIsProcessingPayment(true);
        try {
          await api.updatePaymentStatus({ paymentId, subscriptionId });
          sessionStorage.removeItem('payment-status-v1');
          setHasPaid(true);
          toast.success('Payment successful! You can now create projects.');
        } catch (error) {
          console.error('Error updating payment status:', error);
          toast.error('Still confirming your payment. It activates automatically within a few minutes.');
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
    // Unpaid users normally go straight to /upgrade — but if they arrived with
    // a URL to analyze, let them run the free analysis first. They hit the
    // paywall at "Create Project" instead, after seeing their own keywords.
    const hasPendingAnalysis = typeof window !== 'undefined' && !!sessionStorage.getItem('pending_analyze_url');
    if (user && paymentStatusChecked && hasPaid === false && !isLoading && !isProcessingPayment && !hasPendingAnalysis) {
      router.push('/upgrade');
    }
  }, [user, paymentStatusChecked, hasPaid, isLoading, isProcessingPayment, router]);

  const checkPaymentStatus = async () => {
    try {
      const status = await api.getPaymentStatus();
      setHasPaid(hasActiveAccess(status));
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

  const handleNewProject = () => {
    if (!hasPaid) {
      router.push('/upgrade');
      return;
    }
    router.push('/projects/new');
  };

  // The empty state's URL field hands off to the wizard, which starts the
  // analysis as soon as it opens.
  const handleUrlSubmit = () => {
    if (!hasPaid) {
      router.push('/upgrade');
      return;
    }
    const target = urlInput.trim();
    if (!target) return;
    sessionStorage.setItem('pending_analyze_url', target);
    router.push('/projects/new');
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

  const hasProjects = projects.length > 0;
  // Search and sort earn their place only once the list is long enough to
  // need them. Two cards with a search bar reads as template filler.
  const showControls = projects.length > 6;

  return (
    <div className="relative">
      <div className="mx-auto max-w-[1280px]">
        {/* Header */}
        {hasPaid && paymentStatusChecked && !isLoading && hasProjects && (
          <div className="mb-6">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div>
                <h1 className="font-play text-[30px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink-900 sm:text-[34px]">Projects</h1>
                <p className="mt-1.5 text-[13px] text-ink-400">
                  {projects.length === 1
                    ? <>One product watched on Reddit and in AI answers</>
                    : <><span className="font-semibold tabular-nums text-ink-900">{projects.length}</span> products watched on Reddit and in AI answers</>}
                </p>
              </div>
              <button onClick={handleNewProject} className={BTN_PRIMARY}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                New project
              </button>
            </div>

            {showControls && (
              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search projects"
                    aria-label="Search projects"
                    className="h-9 w-full rounded-lg border-2 border-[#1c1917]/[0.12] bg-white pl-9 pr-3 text-[13px] text-ink-900 placeholder:text-ink-400 transition-colors focus:border-[#1c1917] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'name')}
                    aria-label="Sort projects"
                    className="h-9 px-2.5 rounded-lg bg-transparent text-[13px] font-medium text-ink-600 cursor-pointer transition-colors hover:bg-[#f7f6f4] hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                  >
                    <option value="recent">Recent</option>
                    <option value="name">Name</option>
                  </select>
                  <div className="inline-flex rounded-lg bg-[#f2ede6] p-0.5">
                    <button
                      onClick={() => setView('grid')}
                      className={`p-1.5 rounded-lg transition-colors duration-150 ${view === 'grid' ? 'bg-white text-ink-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : 'text-ink-400 hover:text-ink-600'}`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setView('list')}
                      className={`p-1.5 rounded-lg transition-colors duration-150 ${view === 'list' ? 'bg-white text-ink-900 shadow-[0_1px_2px_rgba(0,0,0,0.06)]' : 'text-ink-400 hover:text-ink-600'}`}
                      aria-label="List view"
                    >
                      <Rows className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(isLoading || !paymentStatusChecked || isProcessingPayment) ? (
          <div className="min-h-[40vh]">
            <div className="flex items-center gap-2 mb-6 text-sm text-ink-600">
              <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
              <p>{isProcessingPayment ? 'Processing payment...' : (paymentStatusChecked && !hasPaid ? 'Redirecting...' : 'Loading projects...')}</p>
            </div>
            <div className={`grid ${view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
              {Array.from({ length: view === 'grid' ? 6 : 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border-2 border-[#1c1917]/[0.08] bg-white p-5">
                  <div className="mb-3 h-4 w-32 rounded-full bg-cream" />
                  <div className="mb-2 h-3 w-full rounded-full bg-cream" />
                  <div className="h-3 w-2/3 rounded-full bg-cream" />
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
          <div className="flex min-h-[60vh] flex-col items-center justify-center px-2 text-center">
            <h1 className="font-play text-[32px] font-extrabold leading-[1.05] tracking-[-0.025em] text-ink-900 sm:text-[40px]">
              Where does your product live?
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-ink-600">
              Paste your website. We read it, work out what you sell, and find the
              Reddit communities already talking about it.
            </p>
            <div className="mt-7 w-full max-w-lg">
              <div className={`${STICKER_PANEL} flex flex-col gap-2 p-2 sm:flex-row`}>
                <label className="relative flex-1">
                  <Globe aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                    placeholder="yourproduct.com"
                    aria-label="Your website"
                    autoFocus
                    className="h-11 w-full rounded-xl bg-transparent pl-10 pr-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40"
                  />
                </label>
                <button
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim()}
                  className={`${BTN_PRIMARY} h-11 shrink-0`}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Analyze
                </button>
              </div>
              <p className="mt-3 text-[12.5px] text-ink-400">
                Takes about 20 seconds, and you can edit everything before it saves. Or{' '}
                <button onClick={handleNewProject} className="rounded font-medium text-ink-600 underline decoration-ink-300 underline-offset-2 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4500]/40">
                  enter details manually
                </button>
                .
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16">
            <p className="text-[14px] text-ink-600">No projects match your search.</p>
            <button
              onClick={() => setQuery('')}
              className="mt-2 text-[13px] font-semibold text-[#b83200] underline decoration-[#ff4500]/40 underline-offset-2 hover:decoration-[#b83200]"
            >
              Clear search
            </button>
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

        {paymentStatusChecked && !hasPaid && <FreeAccessMessage />}
      </div>
    </div>
  );
}
