'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, ArrowRight } from 'lucide-react';
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-[28px] font-bold text-gray-900">Your Projects</h1>
        <button
          onClick={() => hasPaid ? setIsCreateOpen(true) : handleNewProject()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#ff4500] hover:bg-[#e03e00] text-white text-sm font-medium rounded-lg transition-colors shadow-sm w-full sm:w-auto"
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

      {(isLoading || !paymentStatusChecked || isProcessingPayment) ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff4500]" />
          {isProcessingPayment ? (
            <p className="ml-3 text-gray-600">Processing payment...</p>
          ) : paymentStatusChecked && !hasPaid && (
            <p className="ml-3 text-gray-600">Redirecting to upgrade page...</p>
          )}
        </div>
      ) : !hasPaid ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff4500]" />
          <p className="ml-3 text-gray-600">Redirecting to upgrade page...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 text-center">
          <h2 className="text-xl font-semibold">No Projects Yet</h2>
          <p className="text-gray-600 max-w-md">
            Create your first project to start tracking Reddit mentions and generating leads
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
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
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProject}
      />
      <Toaster position="top-center" />
      {/* Only show FreeAccessMessage for unpaid users */}
      {paymentStatusChecked && !hasPaid && <FreeAccessMessage />}
    </div>
  );
}