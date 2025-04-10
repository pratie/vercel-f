'use client';

import { useRedditAuthStore } from '@/lib/redditAuth';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';

export function RedditStatusIndicator() {
  const redditAuth = useRedditAuthStore();
  
  // REMOVE the automatic status check which was causing infinite loops
  // useEffect(() => {
  //   redditAuth.checkStatus(false);
  // }, [redditAuth]);
  
  const handleConnect = () => {
    redditAuth.ensureRedditConnection();
  };
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer",
        redditAuth.isAuthenticated
          ? "text-white hover:bg-white/10"
          : "text-white/70 hover:bg-white/10"
      )}
      onClick={handleConnect}
    >
      {redditAuth.isStatusLoading ? (
        <div className="h-2 w-2 rounded-full bg-amber-300 animate-pulse"></div>
      ) : redditAuth.isAuthenticated ? (
        <CheckCircle className="h-4 w-4 text-green-400" />
      ) : (
        <AlertCircle className="h-4 w-4 text-amber-300" />
      )}
      
      <span className="truncate">
        {redditAuth.isStatusLoading 
          ? 'Checking...'
          : redditAuth.isAuthenticated 
            ? `Reddit: ${redditAuth.username}`
            : 'Reddit: Not Connected'
        }
      </span>
    </div>
  );
}
