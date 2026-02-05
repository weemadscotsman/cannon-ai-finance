# 🚀 DEPLOY TO VERCEL (Your Account)

## Step 1: Push to GitHub (2 minutes)

```bash
# Create new GitHub repo first (don't initialize with README)
# Then run these commands in the project folder:

git remote add origin https://github.com/YOUR_USERNAME/cannon-ai-finance.git
git branch -M main
git push -u origin main
```

**Or use GitHub Desktop:**
1. Open GitHub Desktop
2. Add Local Repository → Select "god folder/finance app"
3. Publish repository
4. Make it public (for free Vercel deployments)

---

## Step 2: Deploy on Vercel (1 minute)

**Go to:** https://vercel.com/new?teamSlug=weemadscotsmans-projects

1. **Import Git Repository**
   - Connect your GitHub account
   - Select `cannon-ai-finance` repo

2. **Configure Project**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   GEMINI_API_KEY = your_gemini_api_key_here
   ```
   
4. **Deploy**
   - Click "Deploy"
   - Wait 60 seconds
   - **LIVE URL CREATED**

---

## Step 3: Add Custom Domain (Optional)

1. Go to project settings in Vercel
2. Domains tab
3. Add: `cannon.finance` or `budgetai.app`
4. Buy domain (~$20/year)

---

## ⚡ ALTERNATIVE: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🎯 POST-DEPLOY CHECKLIST

- [ ] Test landing page loads
- [ ] Click "Start Free" → app opens
- [ ] Add test expense
- [ ] Check AI credits show (usage widget)
- [ ] Hit pricing page works
- [ ] Mobile responsive check

---

## 🚨 TROUBLESHOOTING

**Build fails?**
→ Check that `GEMINI_API_KEY` is set in Environment Variables

**AI features don't work?**
→ API key invalid or missing

**Blank page?**
→ Check browser console for errors

---

**YOUR URL WILL BE:**
`https://cannon-ai-finance.vercel.app`
(or your custom domain)

**GO DEPLOY. NOW.**
