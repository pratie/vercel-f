import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLIC_KEY = 'pk_test_51OWuuESJvhBqpPkFZGwX2uSoRWFnvxJwXHgRJFLbzDlqLXZYmJUhPLPDlxGzOlNzHEjGUFkBxHYVlVOjRFnwDnZS00oBPEVjFw';

export const getStripe = () => {
  return loadStripe(STRIPE_PUBLIC_KEY);
};
