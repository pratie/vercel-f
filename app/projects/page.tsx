'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Toaster, toast } from 'sonner';
import { api, Project } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStripe } from '@/lib/stripe';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPaid, setHasPaid] = useState(false);
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
      const isPaymentSuccess = searchParams.get('payment') === 'success';
      if (isPaymentSuccess && !hasPaid) {
        setIsProcessingPayment(true);
        try {
          await api.updatePaymentStatus();
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

  const checkPaymentStatus = async () => {
    try {
      const status = await api.getPaymentStatus();
      setHasPaid(status.has_paid);
    } catch (error) {
      console.error('Failed to check payment status:', error);
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
    } catch (error) {
      console.error('Delete project error:', error);
      loadProjects();
      toast.error('Failed to delete project. Please try again.');
    }
  };

  const handleNewProject = async () => {
    if (!hasPaid) {
      try {
        const checkoutUrl = await api.createCheckoutSession();
        const stripe = await getStripe();
        if (!stripe) {
          throw new Error('Failed to load Stripe');
        }
        
        // Log the URL for debugging
        console.log('Redirecting to checkout URL:', checkoutUrl);
        
        // Use window.location.assign for better error handling
        window.location.assign(checkoutUrl);
      } catch (error) {
        console.error('Payment process error:', error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error('Failed to start payment process. Please try again.');
        }
      }
      return;
    }
    setIsCreateOpen(true);
  };

  if (isLoading || isProcessingPayment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="mt-4 text-muted-foreground">
          {isProcessingPayment ? 'Processing payment...' : 'Loading projects...'}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-medium">Your Projects</h1>
        <Button onClick={handleNewProject}>
          <Plus className="mr-2 h-4 w-4" /> {hasPaid ? 'New Project' : 'Upgrade to Add Projects'}
        </Button>
      </div>

      {!hasPaid && projects.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upgrade to Create Projects</h3>
          <p className="text-gray-500 mb-4">Get started by upgrading your account to create and track Reddit mentions</p>
          <Button onClick={handleNewProject}>
            Upgrade Now
          </Button>
        </div>
      )}

      {hasPaid && projects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to start tracking Reddit mentions</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={handleDeleteProject} />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}