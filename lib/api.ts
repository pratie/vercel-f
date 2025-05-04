import { API_BASE_URL } from '@/config';

const api = {
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

  // Create checkout session
  async createCheckoutSession() {
    const response = await fetch(`${API_BASE_URL}/payment/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const data = await response.json();
    return data.checkout_url;
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
    console.log('Making request to:', `${API_BASE_URL}/post-reddit-comment/`);
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    console.log('Request body:', data);

    const response = await fetch(`${API_BASE_URL}/post-reddit-comment/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      // Log the error response
      const errorText = await response.text();
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to post comment to Reddit: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Success response:', result);
    return result;
  }
};

export { api };
