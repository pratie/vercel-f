'use client';

import { useEffect, useState } from 'react';
import { getAuthToken } from '@/lib/auth';

export default function RedditCallbackPage() {
  const [status, setStatus] = useState('Connecting to Reddit...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        if (!code || !state) {
          setStatus('Error: Missing authentication parameters');
          return;
        }

        setStatus('Completing authentication...');
        
        // Get the auth token for the API request
        const token = getAuthToken();
        if (!token) {
          setStatus('Error: Not logged in');
          return;
        }
        
        // Call the backend callback endpoint with code and state
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(
          `${API_BASE_URL}/api/reddit-auth/callback/?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to complete Reddit authentication: ${response.status} ${errorText}`);
        }
        
        setStatus('Successfully connected!');
        
        // Close this window and notify the parent window
        if (window.opener) {
          // Set a flag in the parent window to indicate successful connection
          window.opener.postMessage({ type: 'REDDIT_AUTH_SUCCESS' }, window.location.origin);
          
          // Close this window after a short delay to ensure the message is received
          setTimeout(() => {
            window.close();
          }, 500);
        } else {
          // If opened in same window, redirect back to settings with success parameter
          window.location.href = '/settings?reddit_connected=true';
        }
      } catch (error) {
        console.error('Error in Reddit callback:', error);
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-[#ff4500] mb-4">Reddit Authentication</h1>
        
        <div className="flex items-center space-x-3">
          <div className="h-4 w-4 bg-[#ff4500] rounded-full animate-pulse"></div>
          <p className="text-gray-800">{status}</p>
        </div>
        
        <p className="text-gray-500 text-sm mt-4">
          This window will close automatically when authentication is complete.
        </p>
      </div>
    </div>
  );
}
