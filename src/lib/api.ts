// API configuration and endpoints
import { getAuthToken, getUserEmail } from './auth';
import { handleError, logError } from './errorUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 1200000; // 2 minutes

// Ensure API_BASE_URL doesn't have a trailing slash
const getApiBaseUrl = () => {
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    return baseUrl;
};

const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const fetchWithTimeout = async (url: string, options: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), API_TIMEOUT);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        
        if (!response.ok) {
            // Instead of throwing a generic HTTP error, use the handleApiError function
            // which will extract the actual error message from the response
            return handleApiError(response, `HTTP error! status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
        }
        throw error;
    }
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = getHeaders();
    const token = getAuthToken();
    
    // Only log in development environment
    if (process.env.NODE_ENV === 'development') {
        console.log(`API Request: ${options.method || 'GET'} ${url}`);
        console.log('Auth token present:', !!token);
    }
    
    // Ensure we have the Authorization header with the token
    const authHeaders = {
        ...headers,
        ...options.headers,
        'Authorization': token ? `Bearer ${token}` : '',
    };
    
    try {
        const response = await fetchWithTimeout(url, {
            ...options,
            headers: authHeaders,
            mode: 'cors',
        });
        
        // Only log in development environment
        if (process.env.NODE_ENV === 'development') {
            console.log(`API Response: ${options.method || 'GET'} ${url} - Status: ${response.status}`);
        }
        
        return response;
    } catch (error) {
        console.error(`API Error: ${options.method || 'GET'} ${url}`, error);
        throw error;
    }
};

const handleApiError = async (response: Response, defaultMessage: string): Promise<never> => {
    logError(response, `API Error: ${response.url}`);
  
    return response.json()
      .then(data => {
        const message = data.detail || data.message || defaultMessage;
        const error = new Error(message);
        // Add status code to error for better handling
        (error as any).statusCode = response.status;
        throw error;
      })
      .catch(error => {
        // If JSON parsing fails, use the default message
        if (error instanceof SyntaxError) {
          const fallbackError = new Error(defaultMessage);
          (fallbackError as any).statusCode = response.status;
          throw fallbackError;
        }
        throw error;
      });
};

export interface Project {
    id: string;
    name: string;
    description: string;
    keywords: string[];
    subreddits: string[];
}

export interface RedditPost {
    title: string;
    content: string;
    url: string;
    subreddit: string;
    created_utc: number;
    score: number;
    num_comments: number;
    relevance_score: number;
    matching_keywords: string[];
    suggested_comment?: string;
    generated_reply?: string;
}

export interface AnalysisResponse {
    posts: RedditPost[];
    status: string;
}

export interface RedditMention {
    id: number;
    brand_id: number;
    title: string;
    content: string;
    url: string;
    subreddit: string;
    keyword: string;
    score: number;
    num_comments: number;
    suggested_comment: string;
    created_at: string;
    formatted_date: string;
    relevance_score: number;
    created_utc: number;
    matching_keywords: string[];
    intent?: string;
}

export interface PaymentStatus {
    has_paid: boolean;
    payment_date: string | null;
    payment_link: string | null;
    subscription_plan?: string;
    plan_expires_at?: string;
}

export interface PricingPlan {
    id: string;
    name: string;
    price: string;
    billing: string;
    duration: string;
    savings?: string;
    popular?: boolean;
}

export interface PricingPlansResponse {
    plans: PricingPlan[];
}

interface GenerateReplyRequest {
    post_title: string;
    post_content: string;
    brand_id: number;
    include_experience: boolean;
}

interface PreferencesResponse {
  tone: "friendly" | "professional" | "technical";
  response_style: string | null;
  created_at: string;
  updated_at: string;
}

interface PreferencesRequest {
  tone: "friendly" | "professional" | "technical";
  response_style: string | null;
}

interface AlertSettings {
  telegram_chat_id: string;
  enable_telegram_alerts: boolean;
  enable_email_alerts: boolean;
  alert_frequency: 'daily' | 'weekly' | 'realtime';
  is_active?: boolean;
}

export const api = {
    // Project Management
    async createProject(projectData: Omit<Project, 'id'>): Promise<Project> {
        const baseUrl = getApiBaseUrl();
        const response = await fetchWithAuth(`${baseUrl}/projects/`, {
            method: 'POST',
            body: JSON.stringify(projectData),
        });

        if (!response.ok) {
            await handleApiError(response, 'Failed to create project');
        }

        return response.json();
    },

    async getProjects(): Promise<Project[]> {
        try {
            const baseUrl = getApiBaseUrl();
            console.log('Fetching projects from:', `${baseUrl}/projects/`);
            const response = await fetchWithAuth(`${baseUrl}/projects/`, {
                method: 'GET',
            });

            if (!response.ok) {
                console.error('Failed to fetch projects:', response.status, response.statusText);
                await handleApiError(response, 'Failed to fetch projects');
            }

            const data = await response.json();
            console.log('Projects fetched successfully:', data);
            return data;
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    async getProject(projectId: string): Promise<Project> {
        const baseUrl = getApiBaseUrl();
        const response = await fetchWithAuth(`${baseUrl}/projects/${projectId}`, {
            method: 'GET',
        });

        if (!response.ok) {
            await handleApiError(response, 'Failed to fetch project');
        }

        return response.json();
    },

    async deleteProject(projectId: string): Promise<void> {
        const baseUrl = getApiBaseUrl();
        const response = await fetchWithAuth(`${baseUrl}/projects/${projectId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            await handleApiError(response, 'Failed to delete project');
        }
    },

    async updateProject(projectId: string, projectData: Partial<Project>, options: { runAnalysis?: boolean } = {}): Promise<Project> {
        const userEmail = getUserEmail();
        if (!userEmail) {
            throw new Error('User email not found. Please log in again.');
        }

        try {
            // Send all project data in a single request
            const baseUrl = getApiBaseUrl();
            const response = await fetchWithAuth(
                `${baseUrl}/projects/${projectId}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: projectData.name,
                        description: projectData.description,
                        keywords: projectData.keywords || [],
                        subreddits: (projectData.subreddits || []).map(s => s.replace(/^r\//, '')),
                        user_email: userEmail
                    }),
                }
            );

            if (!response.ok) {
                await handleApiError(response, 'Failed to update project');
            }

            // Run analysis if requested
            if (options.runAnalysis && projectData.keywords && projectData.subreddits) {
                await api.analyzeReddit({
                    brand_id: projectId,
                    keywords: projectData.keywords,
                    subreddits: projectData.subreddits,
                });
            }

            // Get updated project
            return await api.getProject(projectId);
        } catch (error) {
            console.error('Error updating project:', error);
            throw error;
        }
    },

    // Initial Analysis
    async analyzeInitial(data: { name: string; description: string }): Promise<{ keywords: string[]; subreddits: string[] }> {
        try {
            const baseUrl = getApiBaseUrl();
            const response = await fetchWithTimeout(`${baseUrl}/analyze/initial`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    name: data.name,
                    description: data.description
                }),
            });

            if (!response.ok) {
                await handleApiError(response, 'Failed to analyze project');
            }

            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error while analyzing project');
        }
    },

    // Reddit Analysis
    async analyzeReddit(params: {
        brand_id: string;
        keywords: string[];
        subreddits: string[];
        time_period?: 'day' | 'week' | 'month';
        limit?: number;
    }): Promise<AnalysisResponse> {
        try {
            const baseUrl = getApiBaseUrl();
            const response = await fetchWithTimeout(`${baseUrl}/analyze/reddit`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    brand_id: parseInt(params.brand_id, 10), // Convert string ID to number
                    keywords: params.keywords,
                    subreddits: params.subreddits,
                    time_period: params.time_period || 'month',
                    limit: params.limit || 500,
                }),
            });

            if (!response.ok) {
                await handleApiError(response, 'Failed to analyze Reddit posts');
            }

            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error while analyzing Reddit posts');
        }
    },

    // Mentions
    async getMentions(brandId: string, skip?: number, limit?: number): Promise<RedditMention[]> {
        const baseUrl = getApiBaseUrl();
        let url = `${baseUrl}/mentions/${parseInt(brandId, 10)}/`;

        const queryParams = new URLSearchParams();
        if (skip !== undefined) {
            queryParams.append('skip', String(skip));
        }
        if (limit !== undefined) {
            queryParams.append('limit', String(limit));
        }

        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }

        const response = await fetchWithAuth(url, {
            method: 'GET',
        });

        if (!response.ok) {
            await handleApiError(response, 'Failed to fetch mentions');
        }

        const mentions = await response.json();
        return mentions.map((mention: any) => ({
            ...mention,
            matching_keywords: Array.isArray(mention.matching_keywords) 
                ? mention.matching_keywords 
                : JSON.parse(mention.matching_keywords || '[]'),
            created_utc: mention.created_utc || Math.floor(new Date(mention.created_at).getTime() / 1000),
            score: mention.score || 0,
            num_comments: mention.num_comments || 0,
            relevance_score: mention.relevance_score || 0,
            suggested_comment: mention.suggested_comment || ""
        }));
    },

    async refreshMentions(
      brandId: string, 
      keywords: string[], 
      subreddits: string[],
      options: {
        time_period?: 'day' | 'week' | 'month';
        limit?: number;
      } = {}
    ): Promise<RedditMention[]> {
        try {
            // First, analyze Reddit and save new mentions
            await api.analyzeReddit({
                brand_id: brandId,
                keywords: keywords,
                subreddits: subreddits,
                time_period: options.time_period || 'week',
                limit: options.limit || 100 // Default to 100 posts if not specified
            });

            // Then immediately fetch the updated mentions
            return await api.getMentions(brandId);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Network error while refreshing mentions');
        }
    },

    // Generate reply for a mention
    generateReply: async (mention: { title: string; content: string; brand_id: number }): Promise<string> => {
        try {
            const baseUrl = getApiBaseUrl();
            const response = await fetchWithAuth(`${baseUrl}/generate-comment/`, {
                method: 'POST',
                body: JSON.stringify({
                    post_title: mention.title,
                    post_content: mention.content,
                    brand_id: mention.brand_id,
                    include_experience: true
                } as GenerateReplyRequest)
            });
            const data = await response.json();
            if (!data || typeof data.comment !== 'string' || data.comment.trim() === '') {
                const detail = (data && (data.detail || data.message)) || 'No reply returned yet. Please try again in a moment.';
                throw new Error(detail);
            }
            return data.comment;
        } catch (error) {
            if (error instanceof Error) {
                // Surface original error to the UI toast
                throw error;
            }
            throw new Error('Failed to generate reply');
        }
    },

    // Post comment to Reddit
    async postRedditComment(data: {
        post_title: string;
        post_content: string;
        brand_id: number;
        post_url: string;
        comment_text: string;
    }): Promise<{ comment: string; comment_url: string; status: string }> {
        const baseUrl = getApiBaseUrl();
        console.log('Making request to:', `${baseUrl}/api/reddit/comment/`);
        console.log('Request body:', data);

        const response = await fetchWithAuth(`${baseUrl}/api/reddit/comment/`, {
            method: 'POST',
            body: JSON.stringify(data)
        });

        return response.json();
    },

    // Reddit OAuth
    async getRedditAuthUrl(): Promise<{ auth_url: string }> {
        try {
            // Make sure we're using the correct endpoint path
            const baseUrl = getApiBaseUrl();
            // Let the backend handle the redirect URI - don't specify it in frontend
            const endpoint = `${baseUrl}/api/reddit-auth/login/`;
            if (process.env.NODE_ENV === 'development') {
                console.log('Requesting Reddit auth URL from:', endpoint);
            }
            
            // Use fetch directly but without credentials mode to avoid CORS issues
            const token = getAuthToken();
            const response = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });
            
            if (!response.ok) {
                console.error('Reddit auth URL request failed:', response.status, response.statusText);
                throw new Error(`Failed to get Reddit auth URL: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Validate the auth URL is from a trusted source
            try {
                if (data.auth_url) {
                    const authUrl = new URL(data.auth_url);
                    const allowedDomains = ['reddit.com', 'www.reddit.com', 'oauth.reddit.com'];
                    if (!allowedDomains.includes(authUrl.hostname)) {
                        throw new Error('Invalid authorization URL domain');
                    }
                }
            } catch (urlError) {
                console.error('Invalid Reddit authorization URL:', urlError);
                throw new Error('Invalid Reddit authorization URL');
            }
            
            if (process.env.NODE_ENV === 'development') {
                console.log('Received Reddit auth URL:', data);
            }
            return data;
        } catch (error) {
            console.error('Error getting Reddit auth URL:', error);
            throw error;
        }
    },

    async getRedditAuthStatus(): Promise<{ is_authenticated: boolean; username: string | null; expires_at: number | null; error?: string }> {
        // Maximum number of retry attempts
        const maxRetries = 3;
        let retryCount = 0;
        let lastError: Error | null = null;
        
        while (retryCount < maxRetries) {
            try {
                // Make sure we're using the correct endpoint path
                const baseUrl = getApiBaseUrl();
                const endpoint = `${baseUrl}/api/reddit-auth/status/`;
                console.log(`Checking Reddit auth status from: ${endpoint} (attempt ${retryCount + 1}/${maxRetries})`);
                
                const response = await fetchWithAuth(endpoint);
                
                if (!response.ok) {
                    // If we get a 429 (rate limit), don't retry but return a structured error response
                    if (response.status === 429) {
                        const data = await response.json().catch(() => ({}));
                        return {
                            is_authenticated: true, // User is still authenticated
                            username: null, // We don't know the username from this error
                            expires_at: null,
                            error: data.detail || 'Rate limit exceeded. You can only post 5 comments per 24 hours.'
                        };
                    }
                    
                    throw new Error(`Failed to check Reddit auth status: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log('Reddit auth status response:', data);
                
                // Check if the response contains rate limit info even with a 200 status
                if (data.rate_limited) {
                    return {
                        is_authenticated: true,
                        username: data.username,
                        expires_at: data.expires_at,
                        error: `Rate limit exceeded. You can only post ${data.limit || 5} comments per ${data.period || '24 hours'}.`
                    };
                }
                
                return data;
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                console.error(`Error checking Reddit auth status (attempt ${retryCount + 1}/${maxRetries}):`, error);
                
                // If it's not a network error, don't retry
                if (!(error instanceof Error) || !error.message.includes('Failed to fetch')) {
                    break;
                }
                
                // Exponential backoff
                const waitTime = 1000 * Math.pow(2, retryCount);
                console.log(`Retrying in ${waitTime}ms...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                retryCount++;
            }
        }
        
        // If we've exhausted all retries, throw the last error
        if (lastError) {
            throw lastError;
        }
        
        // This should never happen, but TypeScript requires a return
        throw new Error('Failed to check Reddit auth status after maximum retries');
    },

    async disconnectReddit(): Promise<{ success: boolean }> {
        try {
            // Make sure we're using the correct endpoint path
            const baseUrl = getApiBaseUrl();
            const endpoint = `${baseUrl}/api/reddit-auth/logout/`;
            console.log('Disconnecting Reddit account from:', endpoint);
            
            const response = await fetchWithAuth(endpoint, {
                method: 'POST'
            });
            
            if (!response.ok) {
                console.error('Reddit disconnect failed:', response.status, response.statusText);
                throw new Error(`Failed to disconnect Reddit account: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Reddit disconnect result:', data);
            return data;
        } catch (error) {
            console.error('Error disconnecting Reddit:', error);
            throw error;
        }
    },

    // Payment
    async getPaymentStatus(): Promise<PaymentStatus> {
        const baseUrl = getApiBaseUrl();
        const response = await fetchWithAuth(`${baseUrl}/payment/status`);
        if (!response.ok) {
            throw await handleApiError(response, 'Failed to get payment status');
        }
        return response.json();
    },

    async getPricingPlans(): Promise<PricingPlansResponse> {
        const baseUrl = getApiBaseUrl();
        const response = await fetchWithAuth(`${baseUrl}/payment/plans`);
        if (!response.ok) {
            throw await handleApiError(response, 'Failed to get pricing plans');
        }
        return response.json();
    },

    async createCheckoutSession(plan: string): Promise<{ checkout_url: string; plan: string; price: string }> {
        try {
            const baseUrl = getApiBaseUrl();
            const response = await fetchWithAuth(`${baseUrl}/payment/create-checkout-session`, {
                method: 'POST',
                body: JSON.stringify({ plan })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create checkout session');
            }
            const data = await response.json();
            if (!data.checkout_url) {
                throw new Error('No checkout URL returned from server');
            }
            return data;
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    },

    async updatePaymentStatus(data?: { paymentId?: string }): Promise<void> {
        const baseUrl = getApiBaseUrl();
        const response = await fetchWithAuth(`${baseUrl}/payment/success`, {
            method: 'POST',
            ...(data?.paymentId ? { body: JSON.stringify({ payment_id: data.paymentId }) } : {})
        });
        if (!response.ok) {
            throw await handleApiError(response, 'Failed to update payment status');
        }
    },

    // Preferences
    getPreferences: async (): Promise<PreferencesResponse> => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Fetching preferences...');
        }
        const response = await fetchWithAuth(`${getApiBaseUrl()}/api/preferences`);
        if (!response.ok) {
            throw await handleApiError(response, 'Failed to fetch preferences');
        }
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
            console.log('Received preferences:', data);
        }
        return data;
    },

    updatePreferences: async (preferences: PreferencesRequest): Promise<PreferencesResponse> => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Updating preferences with:', preferences);
        }
        const response = await fetchWithAuth(`${getApiBaseUrl()}/api/preferences`, {
            method: 'POST',
            body: JSON.stringify({
                tone: preferences.tone,
                response_style: preferences.response_style
            }),
        });
        if (!response.ok) {
            throw await handleApiError(response, 'Failed to update preferences');
        }
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
            console.log('Update preferences response:', data);
        }
        return data;
    },

    // Alert Settings
    getAlertSettings: async (): Promise<AlertSettings> => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Fetching alert settings...');
        }
        const response = await fetchWithAuth(`${getApiBaseUrl()}/api/alerts/settings`);
        if (!response.ok) {
            throw await handleApiError(response, 'Failed to fetch alert settings');
        }
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
            console.log('Received alert settings:', data);
        }
        return data;
    },

    updateAlertSettings: async (settings: AlertSettings): Promise<AlertSettings> => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Updating alert settings with:', settings);
        }
        const response = await fetchWithAuth(`${getApiBaseUrl()}/api/alerts/settings`, {
            method: 'POST',
            body: JSON.stringify(settings),
        });
        if (!response.ok) {
            throw await handleApiError(response, 'Failed to update alert settings');
        }
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
            console.log('Update alert settings response:', data);
        }
        return data;
    },
};
