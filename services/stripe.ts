
// Stripe Integration for CANN.ON.AI
// In production, replace with your actual Stripe publishable key

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here';

// Price IDs from your Stripe Dashboard
const PRICE_IDS = {
  pro_monthly: 'price_pro_monthly_xxx',
  pro_yearly: 'price_pro_yearly_xxx',
  business_monthly: 'price_business_monthly_xxx',
  business_yearly: 'price_business_yearly_xxx',
};

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

/**
 * Initialize Stripe checkout session
 * In production, this should call your backend API which creates the session
 */
export async function createCheckoutSession(
  plan: 'pro' | 'business',
  billingCycle: 'monthly' | 'yearly'
): Promise<CheckoutSession | null> {
  // PRODUCTION: Replace with actual API call to your backend
  // const response = await fetch('/api/create-checkout-session', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ plan, billingCycle }),
  // });
  // return await response.json();

  // DEMO: Simulate checkout
  const priceId = PRICE_IDS[`${plan}_${billingCycle}` as keyof typeof PRICE_IDS];
  
  console.log('Creating checkout for:', { plan, billingCycle, priceId });
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock checkout URL
  return {
    url: `https://checkout.stripe.com/demo?plan=${plan}&cycle=${billingCycle}`,
    sessionId: `cs_test_${Math.random().toString(36).substr(2, 9)}`,
  };
}

/**
 * Handle successful checkout
 * Call this on your success/callback page
 */
export async function handleCheckoutSuccess(sessionId: string): Promise<boolean> {
  // PRODUCTION: Verify session with backend
  // const response = await fetch(`/api/verify-checkout?session_id=${sessionId}`);
  // const result = await response.json();
  // return result.success;
  
  console.log('Verifying checkout:', sessionId);
  return true;
}

/**
 * Create customer portal session for managing subscription
 */
export async function createPortalSession(customerId: string): Promise<string | null> {
  // PRODUCTION: Call your backend
  // const response = await fetch('/api/create-portal-session', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ customerId }),
  // });
  // const result = await response.json();
  // return result.url;
  
  return 'https://billing.stripe.com/demo-portal';
}

// Usage tracking helper
export function getCreditCost(feature: string): number {
  const costs: Record<string, number> = {
    'briefing': 1,
    'planning': 5,
    'planning_audio': 1,
    'live_session': 20,
    'media_veo': 10,
    'media_edit': 10,
    'media_search': 10,
    'receipt_scan': 2,
  };
  return costs[feature] || 1;
}
