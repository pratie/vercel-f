'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Mention {
  id: string;
  text: string;
  username: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  relevanceScore: number;
  subreddit: string;
  url: string;
}

export default function MentionsPage() {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulated data - replace with actual API call
    const mockMentions: Mention[] = [
      {
        id: '1',
        text: "I've been looking for a tool like this! Has anyone tried SNEAKYGUY for Reddit tracking?",
        username: "techEnthusiast",
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        sentiment: 'positive',
        relevanceScore: 0.95,
        subreddit: 'saas',
        url: 'https://reddit.com/r/saas/comments/1'
      },
      {
        id: '2',
        text: "Need recommendations for Reddit monitoring tools. Currently evaluating different options.",
        username: "growthHacker",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        sentiment: 'neutral',
        relevanceScore: 0.85,
        subreddit: 'startups',
        url: 'https://reddit.com/r/startups/comments/2'
      }
    ];

    setTimeout(() => {
      setMentions(mockMentions);
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="font-inter p-6">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/projects"
          className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm">Back to Projects</span>
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-[1.25rem] font-semibold text-gray-900">Recent Mentions</h1>
        </div>
      </div>

      {/* Mentions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Loading mentions...</p>
          </div>
        ) : mentions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No mentions found yet.</p>
          </div>
        ) : (
          mentions.map((mention) => (
            <div
              key={mention.id}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-[0.875rem] font-medium text-gray-900">r/{mention.subreddit}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-[0.875rem] font-medium text-[hsl(var(--primary))]">u/{mention.username}</span>
                </div>
                <span className="text-[0.75rem] text-gray-500">
                  {formatDistanceToNow(new Date(mention.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-[0.875rem] text-gray-600 mb-3">{mention.text}</p>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={mention.sentiment === 'positive' ? 'default' : mention.sentiment === 'negative' ? 'destructive' : 'secondary'}
                  className="text-[0.75rem]"
                >
                  {mention.sentiment}
                </Badge>
                <Badge variant="outline" className="text-[0.75rem]">
                  Score: {(mention.relevanceScore * 100).toFixed(0)}%
                </Badge>
                <a
                  href={mention.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.75rem] text-blue-600 hover:text-blue-800 ml-auto"
                >
                  View on Reddit →
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
