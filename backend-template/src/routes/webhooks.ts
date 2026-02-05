import { Router } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

router.post('/stripe', async (req, res) => {
  const payload = req.body;
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Webhook received:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as 'pro' | 'business';
        
        if (!userId || !plan) {
          console.error('Missing metadata in session');
          break;
        }

        // Update user plan
        await prisma.user.update({
          where: { id: userId },
          data: { 
            plan,
            aiCreditsUsed: 0,
            aiCreditsLimit: 999999 // Unlimited for paid plans
          }
        });

        // Create subscription record
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        
        await prisma.subscription.create({
          data: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            status: subscription.status as any,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          }
        });

        console.log(`User ${userId} upgraded to ${plan}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Notify user of failed payment
        console.log('Payment failed for customer:', invoice.customer);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Downgrade user to free
        const sub = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subscription.id },
          include: { user: true }
        });

        if (sub) {
          await prisma.user.update({
            where: { id: sub.userId },
            data: { 
              plan: 'free',
              aiCreditsLimit: 50
            }
          });

          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'canceled' }
          });

          console.log(`User ${sub.userId} downgraded to free`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status as any,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end
          }
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export { router as webhookRouter };
