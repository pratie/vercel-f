import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

const redditFacts = [
  {
    title: "Massive User Base",
    fact: "Reddit has over 57 million daily active users and 100,000+ active communities.",
  },
  {
    title: "High-Intent Discussions",
    fact: "52% of B2B decision-makers use Reddit for research before making purchase decisions.",
  },
  {
    title: "Quality Leads",
    fact: "Reddit users spend 2X more time researching products compared to other social platforms.",
  },
  {
    title: "Authentic Engagement",
    fact: "Reddit conversations have 3X higher engagement rates than traditional marketing channels.",
  },
  {
    title: "B2B Gold Mine",
    fact: "Tech and business subreddits have some of the highest engagement rates for B2B discussions.",
  },
  {
    title: "Lead Generation Success",
    fact: "Companies report 2.5X higher conversion rates from Reddit-sourced leads.",
  },
  {
    title: "Problem-Solution Fit",
    fact: "71% of Reddit threads start with users seeking solutions to specific problems.",
  },
  {
    title: "Professional Demographics",
    fact: "64% of Reddit users are professionals in decision-making positions.",
  }
];

const tips = [
  "We're analyzing thousands of Reddit posts to find your perfect leads...",
  "Scanning through multiple subreddits for relevant discussions...",
  "Using AI to measure conversation relevance and engagement...",
  "Finding high-intent discussions about your keywords...",
  "Almost there! Processing the most promising leads...",
];

export function RedditAnalysisLoading() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotate facts every 8 seconds
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % redditFacts.length);
    }, 8000);

    // Rotate tips every 5 seconds
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 5000);

    // Update progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 0.2; // Complete in ~8.3 minutes (500 seconds)
      });
    }, 1000);

    return () => {
      clearInterval(factInterval);
      clearInterval(tipInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center space-y-8">
      {/* Loading Animation */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-[hsl(var(--primary))]/20" />
        </div>
        <Loader2 className="w-24 h-24 animate-spin text-[hsl(var(--primary))]" />
      </div>

      {/* Progress Indicator */}
      <div className="w-full max-w-md space-y-2">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[hsl(var(--primary))] transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-500">
          {progress < 100 ? 'Analysis in progress...' : 'Starting a new scan...'}
        </p>
      </div>

      {/* Current Action */}
      <div className="text-lg font-medium text-gray-700 animate-fade-in">
        {tips[currentTipIndex]}
      </div>

      {/* Reddit Fact Card */}
      <div className="max-w-md bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
        <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">
          {redditFacts[currentFactIndex].title}
        </h3>
        <p className="text-gray-600">
          {redditFacts[currentFactIndex].fact}
        </p>
      </div>

      {/* Time Estimate */}
      <p className="text-sm text-gray-500">
        This analysis takes 5-10 minutes. Feel free to explore other projects while we work!
      </p>
    </div>
  );
}
