# ONE-CLICK DEPLOY - CANN.ON.AI FINANCE
# Run this in PowerShell as Administrator

Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║     CANN.ON.AI FINANCE - ONE-CLICK DEPLOY                     ║
║                                                               ║
║     This will:                                                ║
║     1. Push code to GitHub                                    ║
║     2. Open Vercel deploy page                                ║
║                                                               ║
║     You need:                                                 ║
║     - Git installed                                           ║
║     - GitHub account logged in (in browser)                   ║
║     - Vercel account connected to GitHub                      ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host ""

# Check git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git not found. Install from https://git-scm.com/download/win" -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "App.tsx")) {
    Write-Host "❌ Run this script from the 'finance app' folder" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Preparing deployment..." -ForegroundColor Yellow

# Ensure git is ready
if (-not (Test-Path .git)) {
    git init
}

# Configure git (if not already)
git config user.email "deploy@cannon.ai" 2>$null
git config user.name "Deploy Script" 2>$null

# Stage everything
git add -A

# Commit
git commit -m "🚀 Ready for production deploy - CANN.ON.AI Finance SaaS" --allow-empty 2>$null

Write-Host ""
Write-Host "🔗 Connecting to GitHub..." -ForegroundColor Yellow

# Set remote and push
git remote remove origin 2>$null
git remote add origin https://github.com/weemadscotsman/cannon-ai-finance.git
git branch -M main

Write-Host ""
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ CODE PUSHED TO GITHUB!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Opening Vercel deploy page..." -ForegroundColor Cyan
    Start-Process "https://vercel.com/new?teamSlug=weemadscotsmans-projects"
    Write-Host ""
    Write-Host @"
╔═══════════════════════════════════════════════════════════════╗
║     NEXT STEPS (in your browser):                             ║
║                                                               ║
║     1. Click "Import Git Repository"                          ║
║     2. Select "cannon-ai-finance"                             ║
║     3. Framework: Vite (auto-detected)                        ║
║     4. Add Environment Variable:                              ║
║        Name:  GEMINI_API_KEY                                  ║
║        Value: [your key from ai.google.dev]                   ║
║     5. Click DEPLOY                                           ║
║                                                               ║
║     Your site will be live in 60 seconds!                     ║
╚═══════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Green
    Write-Host ""
    Write-Host "Get Gemini key at: https://ai.google.dev/" -ForegroundColor Magenta
} else {
    Write-Host ""
    Write-Host "⚠️  Push failed. You may need to:" -ForegroundColor Yellow
    Write-Host "   1. Create the repo first at https://github.com/new" -ForegroundColor White
    Write-Host "   2. Name it 'cannon-ai-finance'" -ForegroundColor White
    Write-Host "   3. Make it Public, NO README" -ForegroundColor White
    Write-Host "   4. Run this script again" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"
