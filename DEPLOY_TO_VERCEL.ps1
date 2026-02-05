# Deploy CANN.ON.AI Finance to Vercel
Write-Host "🚀 DEPLOYING TO VERCEL" -ForegroundColor Cyan
Write-Host ""

# Check if git is ready
if (-not (Test-Path .git)) {
    Write-Host "Initializing git..." -ForegroundColor Yellow
    git init
}

# Add all files
git add .

# Commit
git commit -m "Ready for Vercel deploy"

Write-Host ""
Write-Host "✅ LOCAL REPO READY" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repo at: https://github.com/new" -ForegroundColor White
Write-Host "2. Name it: cannon-ai-finance" -ForegroundColor White
Write-Host "3. DON'T initialize with README" -ForegroundColor Yellow
Write-Host ""
Write-Host "Then run:" -ForegroundColor Cyan
Write-Host "git remote add origin https://github.com/YOUR_USERNAME/cannon-ai-finance.git" -ForegroundColor Gray
Write-Host "git branch -M main" -ForegroundColor Gray
Write-Host "git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "Then go to:" -ForegroundColor Cyan
Write-Host "https://vercel.com/new?teamSlug=weemadscotsmans-projects" -ForegroundColor Magenta
Write-Host ""
Write-Host "Import your GitHub repo and deploy!" -ForegroundColor Green
