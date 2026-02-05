# 🚀 CANN.ON.AI Backend (Production)

This is the production-ready backend for CANN.ON.AI Finance SaaS.

## Features

- ✅ **Authentication** - Clerk integration
- ✅ **Database** - PostgreSQL with Prisma ORM
- ✅ **AI Proxy** - Secure Gemini API calls
- ✅ **Payments** - Stripe subscriptions
- ✅ **Credit System** - Usage tracking & limits
- ✅ **Webhooks** - Stripe event handling

## Quick Start

### 1. Setup Database

```bash
# Create PostgreSQL database
createdb cannon_finance

# Copy env file
cp .env.example .env

# Edit .env with your credentials
```

### 2. Install & Setup

```bash
npm install
npx prisma generate
npx prisma db push
```

### 3. Run Development

```bash
npm run dev
```

### 4. Deploy

**Railway (Recommended)**
```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

**Render**
- Connect GitHub repo
- Set build command: `npm install && npm run build`
- Set start command: `npm start`
- Add environment variables

## Stripe Setup

1. Create products in Stripe Dashboard:
   - Pro Monthly: $12
   - Pro Yearly: $99  
   - Business Monthly: $39
   - Business Yearly: $390

2. Copy Price IDs to `.env`

3. Set up webhook endpoint:
   - URL: `https://your-api.com/webhooks/stripe`
   - Events: 
     - `checkout.session.completed`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

4. Copy webhook secret to `.env`

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/api/expenses` | GET | Yes | List expenses |
| `/api/expenses` | POST | Yes | Create expense |
| `/api/expenses/:id` | PUT | Yes | Update expense |
| `/api/expenses/:id` | DELETE | Yes | Delete expense |
| `/api/ai/plan` | POST | Yes | Generate plan |
| `/api/ai/speak` | POST | Yes | Text to speech |
| `/api/ai/receipt` | POST | Yes | Parse receipt |
| `/api/ai/usage` | GET | Yes | Get AI usage |
| `/api/billing/checkout` | POST | Yes | Create checkout |
| `/api/billing/portal` | POST | Yes | Customer portal |
| `/api/billing/status` | GET | Yes | Subscription status |
| `/webhooks/stripe` | POST | No | Stripe webhooks |

## Architecture

```
Frontend (Vercel)
    ↓
Backend (Railway/Render)
    ↓
PostgreSQL (Railway/Supabase)
    ↓
Stripe (Payments)
    ↓
Gemini API (AI)
```

## Environment Variables

See `.env.example` for all required variables.

## License

MIT
