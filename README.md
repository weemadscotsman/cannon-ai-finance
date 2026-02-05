# 💰 CANN.ON.AI FORGE.FINANCES

**AI-Powered Personal Finance with Voice Coaching**

A sellable SaaS product that helps users track expenses, plan budgets, and talk to an AI coach about their money in real-time.

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-19-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.8-blue.svg)

---

## 🚀 Features

### Free Tier
- ✅ Up to 100 expenses tracked
- ✅ 50 AI interactions/month
- ✅ Basic receipt scanning
- ✅ Budget tracking & analytics
- ✅ Email support

### Pro Tier ($12/mo or $99/yr)
- 🔥 **Unlimited** expenses
- 🔥 **Unlimited** AI interactions
- 🔥 **Live Voice Coach** - Talk to AI about your money
- 🔥 Advanced receipt scanning
- 🔥 Export to CSV/PDF
- 🔥 Priority support

### Business Tier ($39/mo or $390/yr)
- 🏢 Everything in Pro
- 🏢 Up to 5 team members
- 🏢 Shared budgets
- 🏢 Admin dashboard
- 🏢 API access
- 🏢 White-label options

---

## 💳 Monetization Stack

| Component | Technology |
|-----------|------------|
| Payments | Stripe |
| Auth | LocalStorage (upgrade to Clerk/Firebase for production) |
| Hosting | Vercel |
| AI | Google Gemini API |
| Analytics | Optional: Google Analytics |

---

## 🛠️ Setup & Deployment

### 1. Clone & Install
```bash
git clone <repo-url>
cd "finance app"
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

### 3. Run Locally
```bash
npm run dev
```

### 4. Deploy to Vercel
```bash
npm i -g vercel
vercel --prod
```

---

## 📊 Business Model

### Revenue Projections

| Tier | Price | Target Conversion | Est. Revenue/1k users |
|------|-------|-------------------|----------------------|
| Free | $0 | 100% | $0 |
| Pro | $12/mo | 5% | $600/mo |
| Business | $39/mo | 1% | $390/mo |
| **Total** | | | **$990/mo** |

### Customer Acquisition Strategy
1. **Product Hunt Launch** - Free tier gets initial users
2. **TikTok/Instagram Reels** - Show "talk to your money" feature
3. **Reddit communities** - r/personalfinance, r/YNAB
4. **Indie Hackers** - Share revenue milestones
5. **AppSumo** - Lifetime deal for early traction

---

## 🔄 Production Checklist

- [ ] Add real Stripe integration (backend required for webhooks)
- [ ] Add Clerk/Supabase Auth for user accounts
- [ ] Move API keys to backend (secure proxy)
- [ ] Add database (Supabase/PostgreSQL) for user data
- [ ] Add webhook handlers for Stripe events
- [ ] Add email notifications (Resend/SendGrid)
- [ ] Add analytics (Google Analytics/Plausible)
- [ ] Privacy Policy & Terms of Service
- [ ] Cookie consent banner
- [ ] Add changelog

---

## 📝 License

MIT - Feel free to use, modify, and sell.

---

**Built with ❤️ by CANN.ON.AI FORGE**
