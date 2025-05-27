'use client';

import { create } from 'zustand';
import { getAuthToken } from './auth';
import { api } from './api';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Cache control
const STATUS_CACHE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

interface RedditAuthState {
  isAuthenticated: boolean;
  username: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  isStatusLoading: boolean;
  error: string | null;
  lastChecked: number | null;
  hasWriteAccess: boolean;
  
  // Single check+connect function for unified experience
  ensureRedditConnection: (options?: {
    silent?: boolean,
    redirectOnSuccess?: string,
    onSuccess?: () => void,
    onFailure?: (error: string) => void
  }) => Promise<boolean>;
  
  // Background check that doesn't show UI feedback
  checkStatus: (forceCheck?: boolean) => Promise<any>;
  
  // Connection functions
  connectReddit: () => Promise<void>;
  disconnectReddit: () => Promise<boolean>;
  
  // Action function
  postComment: (params: PostCommentParams) => Promise<PostCommentResponse>;
}

interface PostCommentParams {
  brand_id: number;
  post_url: string;
  post_title: string;
  comment_text: string;
}

interface PostCommentResponse {
  comment: string;
  comment_url: string;
  status: string;
}

export const useRedditAuthStore = create<RedditAuthState>((set, get) => ({
  isAuthenticated: false,
  username: null,
  expiresAt: null,
  isLoading: false,
  isStatusLoading: false,
  error: null,
  lastChecked: null,
  hasWriteAccess: false,

  // Main simplified authentication function that acts as central checkpoint
  ensureRedditConnection: async (options = {}) => {
    const { silent = false, redirectOnSuccess, onSuccess, onFailure } = options;
    const isAuthenticated = get().isAuthenticated;
    
    // If already authenticated, no need to do anything
    if (isAuthenticated) {
      if (onSuccess) onSuccess();
      return true;
    }
    
    // Check status first (if not checked recently)
    try {
      if (!silent) {
        toast.info('Checking Reddit connection...');
      }
      
      const status = await get().checkStatus(true);
      
      // If we're authenticated after checking, we're good!
      if (status.is_authenticated) {
        if (onSuccess) onSuccess();
        if (!silent) {
          toast.success('Connected to Reddit as ' + status.username);
        }
        return true;
      }
      
      // If not authenticated, prompt user to connect
      if (!silent) {
        toast.error('Reddit connection required', {
          description: 'Please connect your Reddit account to continue',
          action: {
            label: 'Connect',
            onClick: () => {
              get().connectReddit()
                .then(() => {
                  if (redirectOnSuccess) {
                    window.location.href = redirectOnSuccess;
                  }
                  if (onSuccess) onSuccess();
                })
                .catch(error => {
                  if (onFailure) onFailure(error.message);
                });
            }
          }
        });
      }
      
      return false;
    } catch (error) {
      console.error('Error ensuring Reddit connection:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (!silent && errorMessage) {
        toast.error('Reddit connection error', {
          description: errorMessage
        });
      }
      
      if (onFailure) onFailure(errorMessage);
      return false;
    }
  },

  checkStatus: async (forceCheck = false) => {
    const currentTime = Date.now();
    const lastChecked = get().lastChecked;
    
    // Skip the check if we've checked recently, unless forceCheck is true
    if (!forceCheck && lastChecked && currentTime - lastChecked < STATUS_CACHE_TIME) {
      console.log('Using cached Reddit auth status');
      return {
        is_authenticated: get().isAuthenticated,
        username: get().username,
        expires_at: get().expiresAt
      };
    }
    
    // Check if we're currently rate limited
    const rateLimitKey = 'reddit_auth_rate_limited';
    let rateLimitUntil: string | null = null;
    if (typeof window !== 'undefined') {
      rateLimitUntil = localStorage.getItem(rateLimitKey);
    }
    
    if (rateLimitUntil && parseInt(rateLimitUntil, 10) > currentTime) {
      console.log('Skipping Reddit auth check due to rate limiting');
      return {
        is_authenticated: get().isAuthenticated,
        username: get().username,
        expires_at: get().expiresAt
      };
    }
    
    set({ isStatusLoading: true });
    
    try {
      console.log('Checking Reddit auth status...');
      const data = await api.getRedditAuthStatus();
      
      console.log('Reddit auth status:', data);
      
      // Clear any stored rate limit if the request succeeds
      if (typeof window !== 'undefined') {
        localStorage.removeItem(rateLimitKey);
      }
      
      set({
        isAuthenticated: data.is_authenticated,
        username: data.username,
        expiresAt: data.expires_at,
        lastChecked: currentTime,
        isStatusLoading: false,
        error: data.error || null
      });
      
      return data;
    } catch (error) {
      console.error('Error checking Reddit auth status:', error);
      
      // Handle rate limiting
      if (error instanceof Error && error.message.includes('429')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(rateLimitKey, String(currentTime + 10 * 60 * 1000));
        }
      }
      
      // Create a sanitized error message
      let errorMessage = 'Unable to verify Reddit connection status';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Please check your internet connection';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out: Server may be busy, please try again later';
        } else if (error.message.includes('rate limit') || error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        }
      }
      
      set({
        isStatusLoading: false,
        error: errorMessage
      });
      
      return {
        is_authenticated: get().isAuthenticated,
        username: get().username,
        expires_at: get().expiresAt,
        error: errorMessage
      };
    }
  },

  connectReddit: async () => {
    set({ isLoading: true, error: null });
    let popupCheckInterval: number | null = null;
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('You must be logged in to connect your Reddit account');
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Initiating Reddit OAuth flow...');
      }
      
      try {
        const data = await api.getRedditAuthUrl();
        
        if (!data || !data.auth_url) {
          throw new Error('Failed to get Reddit authorization URL');
        }
        
        // Validate the auth URL is from a trusted source
        try {
          const authUrl = new URL(data.auth_url);
          const allowedDomains = ['reddit.com', 'www.reddit.com', 'oauth.reddit.com'];
          if (!allowedDomains.includes(authUrl.hostname)) {
            throw new Error('Invalid authorization URL domain');
          }
        } catch (urlError) {
          throw new Error('Invalid Reddit authorization URL');
        }
        
        // Open the Reddit auth URL in a popup
        const width = 800;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          data.auth_url,
          'RedditAuth',
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Check if the popup was blocked
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
          throw new Error('Popup was blocked. Please allow popups for this site.');
        }
        
        // Add an event listener to listen for messages from the popup
        const messageListener = (event: MessageEvent) => {
          // Strictly verify the message is coming from our app
          const expectedOrigin = window.location.origin;
          if (event.origin !== expectedOrigin) {
            console.error(`Rejected message from unexpected origin: ${event.origin}`);
            return;
          }
          
          if (event.data && event.data.type === 'REDDIT_AUTH_SUCCESS') {
            if (process.env.NODE_ENV === 'development') {
              console.log('Received successful Reddit auth message from popup');
            }
            
            // Clear the interval if it exists
            if (popupCheckInterval) {
              clearInterval(popupCheckInterval);
              popupCheckInterval = null;
            }
            
            // Remove the event listener
            window.removeEventListener('message', messageListener);
            
            // Force a fresh check of the Reddit auth status
            set({ lastChecked: null });
            get().checkStatus(true);
            
            // Show success notification
            toast.success('Successfully connected to Reddit!');
          }
        };
        
        // Add the event listener
        window.addEventListener('message', messageListener);
        
        // Poll to check when the popup is closed (fallback mechanism)
        popupCheckInterval = window.setInterval(() => {
          if (popup.closed) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Reddit auth popup closed, checking status...');
            }
            
            // Remove the event listener
            window.removeEventListener('message', messageListener);
            
            if (popupCheckInterval) {
              clearInterval(popupCheckInterval);
              popupCheckInterval = null;
            }
            
            // Force a fresh check
            set({ lastChecked: null });
            get().checkStatus(true);
          }
        }, 500);
      } catch (error) {
        // Handle network errors specifically
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          throw new Error('Network error: Unable to connect to the Reddit auth service.');
        }
        throw error;
      }
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Reddit connect error:', error);
      
      if (popupCheckInterval) {
        clearInterval(popupCheckInterval);
      }
      
      // Provide user-friendly error message
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Network error: Unable to connect to the Reddit auth service.';
        } else if (error.message.includes('404')) {
          errorMessage = 'API endpoint not found. Please contact support.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication error. Please try logging out and logging back in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      set({
        isLoading: false,
        error: errorMessage
      });
    }
  },

  disconnectReddit: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.disconnectReddit();
      
      if (response && response.success) {
        // Update state to reflect disconnection
        set({
          isAuthenticated: false,
          username: null,
          expiresAt: null,
          isLoading: false,
          lastChecked: Date.now()
        });
        return true;
      } else {
        throw new Error('Unexpected response from disconnect endpoint');
      }
    } catch (error) {
      console.error('Error disconnecting Reddit account:', error);
      
      // Provide user-friendly error message
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to disconnect from Reddit.';
        } else if (error.message.includes('404')) {
          errorMessage = 'API endpoint not found. Please contact support.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Authentication error. Please try logging out and logging back in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      set({
        isLoading: false,
        error: errorMessage
      });
      
      return false;
    }
  },

  postComment: async (params: PostCommentParams) => {
    // First ensure we're connected to Reddit
    const connected = await get().ensureRedditConnection({
      silent: false
    });
    
    if (!connected) {
      throw new Error('Reddit connection required to post comments');
    }
    
    set({ isLoading: true, error: null });
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('You must be logged in to post a comment');
      }

      const response = await api.postRedditComment({
        post_title: params.post_title,
        post_content: '', // This will be populated by the backend
        brand_id: params.brand_id,
        post_url: params.post_url,
        comment_text: params.comment_text
      });

      set({ isLoading: false });
      return response;
    } catch (error) {
      console.error('Reddit post comment error:', error);
      
      // Handle specific error cases better
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        // Check for Reddit rate limiting errors
        if (error.message.includes('rate limit') || error.message.includes('try again later')) {
          errorMessage = 'Reddit limits comments to prevent spam. Please wait a few minutes before trying again.';
          
          // Store rate limiting information to prevent further attempts
          const currentTime = Date.now();
          if (typeof window !== 'undefined') {
            localStorage.setItem('reddit_comment_rate_limited', String(currentTime + 5 * 60 * 1000)); // 5 minute cooldown
          }
          
          toast.error('Rate limited by Reddit', {
            description: 'Reddit limits how frequently you can post comments. Please wait a few minutes before trying again.',
            duration: 5000
          });
        } else if (error.message.includes('already posted')) {
          errorMessage = 'You have already posted this comment on Reddit.';
        } else {
          errorMessage = error.message;
        }
      }
      
      set({
        isLoading: false,
        error: errorMessage
      });
      
      throw error; // Throw the original error to preserve the message
    }
  }
}));
