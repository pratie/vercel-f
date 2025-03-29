'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, RefreshCw, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface RedditPost {
  id: string;
  author: string;
  title: string;
  score: number;
  created_utc: string;
  subreddit: string;
  num_comments: number;
  permalink: string;
}

export default function ExplorePage() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchPosts = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const params = new URLSearchParams();
      params.append('query', query);
      params.append('limit', '500');
      params.append('offset', '0');
      
      if (subreddit.trim()) {
        params.append('subreddit', subreddit.trim());
      }
      
      const response = await fetch(`http://127.0.0.1:8000/explore/posts/?${params.toString()}`, {
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchPosts();
  };

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
        <h1 className="text-[1.25rem] font-semibold text-gray-900 mb-4">Explore Reddit Posts</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                Search Query (required)
              </label>
              <div className="relative">
                <Input
                  id="query"
                  type="text"
                  placeholder="e.g., saas lead generation"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-10"
                  required
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label htmlFor="subreddit" className="block text-sm font-medium text-gray-700 mb-1">
                Subreddit (optional)
              </label>
              <Input
                id="subreddit"
                type="text"
                placeholder="e.g., SaaS"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-[#ff4500] hover:bg-[#ff4500]/90 text-white"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search Posts
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Searching Reddit posts...</p>
          </div>
        ) : hasSearched && posts.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No posts found for your search criteria.</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search terms or removing the subreddit filter.</p>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-medium text-gray-900">Search Results</h2>
              <span className="text-sm text-gray-500">{posts.length} posts found</span>
            </div>
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[0.875rem] font-medium text-gray-900">r/{post.subreddit}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-[0.875rem] font-medium text-[#ff4500]">u/{post.author}</span>
                  </div>
                  <span className="text-[0.75rem] text-gray-500">
                    {formatDistanceToNow(new Date(post.created_utc), { addSuffix: true })}
                  </span>
                </div>
                <h3 className="text-[1rem] font-medium text-gray-900 mb-3">{post.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[0.75rem]">
                    Score: {post.score}
                  </Badge>
                  <Badge variant="outline" className="text-[0.75rem]">
                    Comments: {post.num_comments}
                  </Badge>
                  <a
                    href={`${post.permalink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[0.75rem] text-blue-600 hover:text-blue-800 ml-auto flex items-center"
                  >
                    View on Reddit
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
