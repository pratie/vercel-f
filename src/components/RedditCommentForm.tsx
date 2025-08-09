'use client';

import { useState } from 'react';
import { useRedditAuthStore } from '@/lib/redditAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface RedditCommentFormProps {
  brandId: number;
  postUrl: string;
  postTitle: string;
  postContent?: string;
  initialComment?: string;
  onSuccess?: (commentUrl: string) => void;
}

export function RedditCommentForm({
  brandId,
  postUrl,
  postTitle,
  postContent = '',
  initialComment = '',
  onSuccess
}: RedditCommentFormProps) {
  const [comment, setComment] = useState(initialComment);
  const redditAuth = useRedditAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishedCommentUrl, setPublishedCommentUrl] = useState<string | null>(null);
  const [publishStatus, setPublishStatus] = useState<'unpublished' | 'published' | 'already_exists'>('unpublished');

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      // Use the new ensureRedditConnection function which will handle auth internally
      const isConnected = await redditAuth.ensureRedditConnection({
        silent: false,
        onSuccess: async () => {
          try {
            const result = await redditAuth.postComment({
              brand_id: brandId,
              post_url: postUrl,
              post_title: postTitle,
              comment_text: comment
            });

            // Set the published status based on the API response
            setPublishStatus(result.status as 'published' | 'already_exists');
            setPublishedCommentUrl(result.comment_url);
            
            const successMessage = result.status === 'already_exists' 
              ? 'Comment already exists on this post' 
              : 'Comment posted successfully!';
              
            toast.success(successMessage, {
              action: {
                label: 'View',
                onClick: () => window.open(result.comment_url, '_blank')
              }
            });
            
            if (onSuccess) {
              onSuccess(result.comment_url);
            }
          } catch (error) {
            handleError(error);
          } finally {
            setIsSubmitting(false);
          }
        },
        onFailure: (error) => {
          toast.error('Unable to connect to Reddit', {
            description: error
          });
          setIsSubmitting(false);
        }
      });
      
      // If not connected and the onSuccess callback wasn't triggered
      if (!isConnected) {
        setIsSubmitting(false);
      }
    } catch (error) {
      handleError(error);
      setIsSubmitting(false);
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      toast.error('Failed to post comment', {
        description: error.message
      });
    } else {
      toast.error('Failed to post comment');
    }
  };

  const openRedditComment = () => {
    if (publishedCommentUrl) {
      window.open(publishedCommentUrl, '_blank');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Post Comment to Reddit</CardTitle>
          {publishStatus !== 'unpublished' && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${publishStatus === 'published' ? 'text-green-600' : 'text-amber-600'}`}>
                {publishStatus === 'published' ? 'Published' : 'Already Exists'}
              </span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Write your comment here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
          disabled={isSubmitting || publishStatus !== 'unpublished'}
        />
        
        {!redditAuth.isAuthenticated && (
          <div className="mt-2 text-sm text-amber-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            You need to connect your Reddit account to post comments.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <div className="flex gap-2">
          {publishedCommentUrl && (
            <Button variant="outline" size="sm" onClick={openRedditComment}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View on Reddit
            </Button>
          )}
        </div>
        
        {publishStatus === 'unpublished' && (
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !comment.trim()}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
