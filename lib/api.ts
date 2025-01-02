import { API_BASE_URL } from '@/config';

// Get payment status
export async function getPaymentStatus() {
  const response = await fetch(`${API_BASE_URL}/payment/status`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to get payment status');
  }

  return response.json();
};

// Create checkout session
export async function createCheckoutSession() {
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
}

// Update payment status after successful payment
export async function updatePaymentStatus() {
  const response = await fetch(`${API_BASE_URL}/payment/success`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to update payment status');
  }

  return response.json();
};
