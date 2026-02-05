# 🚀 Deploy Guide: CANN.ON.AI Finance SaaS

## Quick Start (5 minutes)

### 1. Get API Keys

**Google Gemini (Required)**
- Go to https://ai.google.dev/
- Create API key
- Add to `.env.local`: `GEMINI_API_KEY=your_key`

**Stripe (Required for payments)**
- Go to https://dashboard.stripe.com
- Get Publishable key (pk_test_...)
- Add to `.env.local`: `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...`

### 2. Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or use GitHub integration:
1. Push code to GitHub
2. Connect repo at https://vercel.com/new
3. Add environment variables in Vercel dashboard
4. Deploy

### 3. Configure Stripe Products

In Stripe Dashboard, create:

**Product: Pro Plan**
- Price: $12/month
- Price ID: `price_pro_monthly_xxx`
- OR $99/year (17% discount)
- Price ID: `price_pro_yearly_xxx`

**Product: Business Plan**
- Price: $39/month  
- Price ID: `price_business_monthly_xxx`
- OR $390/year
- Price ID: `price_business_yearly_xxx`

Update `services/stripe.ts` with your actual Price IDs.

---

## Production Checklist

### Phase 1: MVP (You're here)
- ✅ Landing page with pricing
- ✅ Free tier with limits
- ✅ Upgrade prompts
- ✅ Usage tracking
- ✅ Privacy/Terms pages

### Phase 2: Backend (Recommended)
- [ ] Node.js/Express backend
- [ ] PostgreSQL database
- [ ] User authentication (Clerk/Supabase)
- [ ] Stripe webhook handlers
- [ ] Secure API proxy (hide Gemini key)
- [ ] User data persistence

### Phase 3: Scale
- [ ] Email automation (Resend)
- [ ] Analytics (Plausible/GA)
- [ ] Affiliate program
- [ ] API for Business tier

---

## Current Limitations (Demo Mode)

The current implementation uses:
- **LocalStorage** for data (users lose data if they clear browser)
- **Simulated Stripe** (alerts instead of real checkout)
- **Client-side AI** (API key exposed in frontend - OK for demo, not for scale)

To go full production, you need a backend.

---

## Backend Template (Node.js)

See `/backend-template` folder for:
- Express server
- Prisma schema
- Stripe webhooks
- Auth middleware
- AI proxy endpoints

---

## Marketing Assets

### Tagline Ideas
- "Talk to your money"
- "AI that actually knows your budget"
- "Stop guessing. Start knowing."

### Launch Checklist
- [ ] Product Hunt submission
- [ ] Twitter/X announcement thread
- [ ] Reddit posts (r/personalfinance, r/SideProject)
- [ ] Indie Hackers post
- [ ] Hacker News Show HN

---

**Questions?** Email: support@cannon.ai
