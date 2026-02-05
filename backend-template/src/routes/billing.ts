import { Router } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

// Create checkout session
router.post('/checkout', async (req: any, res) => {
  try {
    const clerkId = req.auth.userId;
    const { plan, billingCycle } = req.body;

    const user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get or create Stripe customer
    let customerId = user.subscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id }
      });
      customerId = customer.id;
    }

    // Price IDs from environment
    const priceIds: Record<string, string> = {
      'pro_monthly': process.env.STRIPE_PRO_MONTHLY_PRICE!,
      'pro_yearly': process.env.STRIPE_PRO_YEARLY_PRICE!,
      'business_monthly': process.env.STRIPE_BUSINESS_MONTHLY_PRICE!,
      'business_yearly': process.env.STRIPE_BUSINESS_YEARLY_PRICE!,
    };

    const priceId = priceIds[`${plan}_${billingCycle}`];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { userId: user.id, plan }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout Error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Create customer portal session
router.post('/portal', async (req: any, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { subscription: true }
    });

    if (!user?.subscription?.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/settings`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal Error:', error);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

// Get subscription status
router.get('/status', async (req: any, res) => {
  try {
    const clerkId = req.auth.userId;
    const user = await prisma.user.findUnique({
      where: { clerkId },
      include: { subscription: true }
    });

    res.json({
      plan: user?.plan || 'free',
      subscription: user?.subscription
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

export { router as billingRouter };
