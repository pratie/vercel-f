'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Rocket, ArrowRight } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Toaster, toast } from 'sonner';
import { api, Project } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStripe } from '@/lib/stripe';
import Image from 'next/image';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-[28px] font-bold text-gray-900">Your Projects</h1>
        <Button
          onClick={() => hasPaid ? setIsCreateOpen(true) : handleNewProject()}
          className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white px-6"
          size="lg"
        >
          {hasPaid ? (
            <>
              <Plus className="mr-2 h-5 w-5" />
              New Project
            </>
          ) : (
            <>
              Upgrade to Add Projects
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff4500]" />
        </div>
      ) : !hasPaid ? (
        <div className="flex flex-col items-center justify-center max-w-[560px] mx-auto">
          <div className="text-center w-full">
            <h2 className="text-[32px] font-bold text-gray-900 mb-6">Upgrade to Create Projects</h2>
            <div className="relative w-full mb-8">
              <Image 
                src="/dash_design.png" 
                alt="Dashboard Preview" 
                width={500}
                height={375}
                className="rounded-xl shadow-lg w-full"
                priority
              />
            </div>
            <div className="max-w-[440px] mx-auto">
              <p className="text-base text-gray-600 mb-6">
                Get started by upgrading your account to create and track Reddit mentions. Unlock powerful features:
              </p>
              <ul className="space-y-3 text-left mb-8">
                <li className="flex items-center gap-3">
                  <Rocket className="h-5 w-5 text-[#ff4500] flex-shrink-0" />
                  <span className="text-base text-gray-700">AI-powered keyword discovery</span>
                </li>
                <li className="flex items-center gap-3">
                  <Rocket className="h-5 w-5 text-[#ff4500] flex-shrink-0" />
                  <span className="text-base text-gray-700">Smart relevance scoring</span>
                </li>
                <li className="flex items-center gap-3">
                  <Rocket className="h-5 w-5 text-[#ff4500] flex-shrink-0" />
                  <span className="text-base text-gray-700">Real-time mention tracking</span>
                </li>
              </ul>
              
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl text-gray-400 line-through font-medium">$120</span>
                  <span className="text-2xl font-bold text-[#ff4500]">$39</span>
                  <span className="bg-[#ff4500] text-white text-xs font-semibold px-2 py-1 rounded-full">Save 67%</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Early Adopter Special Offer</p>
              </div>

              <Button 
                onClick={handleNewProject}
                className="w-full bg-[#ff4500] hover:bg-[#ff4500]/90 text-white font-semibold py-5 text-base rounded-xl shadow-sm mb-2"
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Upgrade Now - Lifetime Access
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500 text-center">One-time payment, lifetime access</p>
            </div>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <h3 className="text-xl font-medium text-gray-900 mb-4">No projects yet</h3>
          <p className="text-gray-600 mb-6">Create your first project to start tracking Reddit mentions</p>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={() => handleDeleteProject(project.id)}
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
    </div>
  );
}