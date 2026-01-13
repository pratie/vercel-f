import { API_BASE_URL } from '@/config';

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  billing: string;
  duration: string;
  savings?: string;
  popular: boolean;
  description?: string;
}

export interface ApiType {
  getPaymentStatus: () => Promise<any>;
  createCheckoutSession: (plan: string, datafastVisitorId?: string) => Promise<any>;
  updatePaymentStatus: (data?: { paymentId?: string | null }) => Promise<any>;
  postRedditComment: (data: {
    post_title: string;
    post_content: string;
    brand_id: number;
    post_url: string;
    comment_text: string;
  }) => Promise<any>;
  getPricingPlans: () => Promise<{ plans: PricingPlan[] }>;
}

const api: ApiType = {
  // Get payment status
  async getPaymentStatus() {
    const response = await fetch(`${API_BASE_URL}/payment/status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get payment status');
    }

    return response.json();
  },

  // Get pricing plans
  async getPricingPlans() {
    const response = await fetch(`${API_BASE_URL}/payment/plans`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch pricing plans');
    }

    return response.json();
  },

  // Create checkout session
  async createCheckoutSession(plan: string, datafastVisitorId?: string) {
    const response = await fetch(`${API_BASE_URL}/payment/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plan,
        datafast_visitor_id: datafastVisitorId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  },

  // Update payment status after successful payment
  async updatePaymentStatus(data?: { paymentId?: string | null }) {
    const response = await fetch(`${API_BASE_URL}/payment/success`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: data ? JSON.stringify(data) : undefined
    });

    if (!response.ok) {
      throw new Error('Failed to update payment status');
    }

    return response.json();
  },

  // Post comment to Reddit
  async postRedditComment(data: {
    post_title: string;
    post_content: string;
    brand_id: number;
    post_url: string;
    comment_text: string;
  }) {
    console.log('Making request to:', `${API_BASE_URL}/api/reddit/comment/`);
    const response = await fetch(`${API_BASE_URL}/api/reddit/comment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to post comment to Reddit: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
};

export { api };
