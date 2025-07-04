'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Rocket, ArrowRight, Star, Zap, Target, TrendingUp, Users, MessageSquare, CheckCircle, Clock, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Toaster, toast } from 'sonner';
import { api, Project } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FreeAccessMessage } from '../components/FreeAccessMessage';

// Enhanced Upgrade Experience Component
function UpgradeExperience({ handleNewProject, isProcessingPayment }: { handleNewProject: () => void; isProcessingPayment: boolean }) {
  const upgradeButtonRef = useRef<HTMLButtonElement>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      text: "SneakyGuy helped me find 15 qualified leads in the first week!",
      author: "Sarah M., SaaS Founder",
      rating: 5
    },
    {
      text: "The AI responses are so natural, I'm getting actual conversations.",
      author: "Mike R., Growth Marketer",
      rating: 5
    },
    {
      text: "Saved me 10+ hours per week on Reddit monitoring.",
      author: "Jessica L., Marketing Director",
      rating: 5
    }
  ];

  const features = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "AI-Powered Lead Discovery",
      description: "Find qualified leads 10x faster with smart keyword matching",
      color: "text-blue-600"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Smart Relevance Scoring",
      description: "Only get notified about high-quality opportunities",
      color: "text-green-600"
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: "Auto-Generated Responses",
      description: "AI crafts personalized replies that convert",
      color: "text-purple-600"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Real-Time Tracking",
      description: "Never miss a mention across 15+ subreddits",
      color: "text-orange-600"
    }
  ];

  const stats = [
    { number: "2,500+", label: "Leads Generated", icon: <Users className="h-5 w-5" /> },
    { number: "89%", label: "Response Rate", icon: <MessageSquare className="h-5 w-5" /> },
    { number: "30hrs", label: "Saved Monthly", icon: <Clock className="h-5 w-5" /> }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUpgradeClick = () => {
    // Confetti burst for delight
    if (upgradeButtonRef.current) {
      const rect = upgradeButtonRef.current.getBoundingClientRect();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: rect.top / window.innerHeight },
        colors: ['#ff4500', '#ff6b3d', '#ffa500']
      });
    }
    handleNewProject();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#ff4500]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#ff4500]/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-[#ff4500]/10 text-[#ff4500] mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Launch Special - 67% Off</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 font-heading">
                Turn Reddit Into Your
                <br />
                <span className="bg-gradient-to-r from-[#ff4500] to-[#ff6b3d] bg-clip-text text-transparent">
                  Lead Generation Machine
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join 100+ businesses already using SneakyGuy to find qualified leads while they sleep
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#ff4500]/10 text-[#ff4500] mb-3">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mb-20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff4500]/20 to-[#ff6b3d]/20 rounded-2xl blur-xl" />
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                </div>
              </div>
              <Image 
                src="/dash_design.png" 
                alt="SneakyGuy Dashboard Preview" 
                width={800}
                height={600}
                className="w-full"
                priority
              />
            </div>
            
            {/* Floating success message */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="absolute -right-4 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium hidden lg:block"
            >
              <CheckCircle className="h-4 w-4 inline mr-2" />
              3 new leads found!
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-white mb-4 ${feature.color}`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-heading">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-20">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8 font-heading">What Our Users Say</h3>
            <div className="max-w-2xl mx-auto">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-4 italic">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <p className="text-sm text-gray-500">{testimonials[currentTestimonial].author}</p>
              </motion.div>
            </div>
          </div>

          {/* Pricing CTA */}
          <div className="bg-gradient-to-r from-[#ff4500] to-[#ff6b3d] rounded-2xl p-8 text-white text-center">
            <h3 className="text-3xl font-bold mb-4 font-heading">Ready to 10x Your Lead Generation?</h3>
            <p className="text-lg mb-8 text-white/90">Join hundreds of businesses already using SneakyGuy</p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl text-white/60 line-through">$120/month</div>
                <div className="text-4xl font-bold">$39</div>
                <div className="text-sm text-white/80">One-time payment</div>
              </div>
              <div className="bg-white/20 rounded-full px-4 py-2">
                <span className="text-sm font-semibold">Save 67%</span>
              </div>
            </div>
            
            <motion.button
              ref={upgradeButtonRef}
              onClick={handleUpgradeClick}
              disabled={isProcessingPayment}
              className="bg-white text-[#ff4500] font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Get Lifetime Access Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </motion.button>
            
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>7-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>No recurring fees</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      try {
        const checkoutUrl = await api.createCheckoutSession();
        
        // Log the URL for debugging
        console.log('Redirecting to checkout URL:', checkoutUrl);
        
        // Redirect directly to DodoPayments checkout
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

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-[#ff4500]" />
        </div>
      ) : !hasPaid ? (
        <UpgradeExperience handleNewProject={handleNewProject} isProcessingPayment={isProcessingPayment} />
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
      {!hasPaid && <FreeAccessMessage />}
    </div>
  );
}