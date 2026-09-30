# ==============================================================================
# FN ROCKET LEAGUE MASTER-ENGINE: GIT REPOSITORY CONFIGURATION & PUSH AUTOMATION
# Script: git-init-fix.ps1
# Repository: https://github.com/userfn-git/FN-MasterEngine-RL.git
# Encoding: Pure ASCII / English Only (Cross-Shell Safe, Zero Non-ASCII Characters)
# ==============================================================================

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
[Console]::OutputEncoding = [System.Text.Encoding]::ASCII

$ErrorActionPreference = "Stop"

$projectRoot = "C:\FN-MasterEngine-RL"
if (-not (Test-Path $projectRoot)) {
    New-Item -ItemType Directory -Path $projectRoot -Force | Out-Null
}
Set-Location $projectRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   FN MASTER-ENGINE: GIT SETUP & TRACKING REPAIR TOOL     " -ForegroundColor Green
Write-Host "   Working Directory: $projectRoot                        " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Reset Environment Variables that cause exit code 66 errors
Remove-Item Env:\GIT_ASKPASS -ErrorAction SilentlyContinue
Remove-Item Env:\SSH_ASKPASS -ErrorAction SilentlyContinue

# 2. Configure Windows Credential Manager and Default Branch
git config --global credential.helper manager
git config --global init.defaultBranch main

# 3. Initialize Git if not already a repository
if (-not (Test-Path "$projectRoot\.git")) {
    Write-Host "[1/5] Initializing local Git repository..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "[1/5] Git repository already initialized." -ForegroundColor Green
}

# 4. Set Remote Origin to https://github.com/userfn-git/FN-MasterEngine-RL.git
Write-Host "[2/5] Setting remote origin URL..." -ForegroundColor Yellow
$targetRemote = "https://github.com/userfn-git/FN-MasterEngine-RL.git"

git remote remove origin 2>$null
git remote add origin $targetRemote
Write-Host "[OK] Remote origin set to: $targetRemote" -ForegroundColor Green

# 5. Reset Branch to main
Write-Host "[3/5] Setting branch name to main..." -ForegroundColor Yellow
git branch -M main

# 6. Stage and Commit Uncommitted Files
Write-Host "[4/5] Staging files and creating commit..." -ForegroundColor Yellow
git add .
$commitStatus = git status --porcelain
if ($commitStatus) {
    git commit -m "feat: synchronize master engine standalone release and sqlite database"
    Write-Host "[OK] Changes committed to main." -ForegroundColor Green
} else {
    Write-Host "[OK] Working tree clean; ready to push." -ForegroundColor Green
}

# 7. Push to GitHub with Tracking
Write-Host "[5/5] Pushing to origin/main and configuring upstream tracking..." -ForegroundColor Yellow

# Check if token is passed as argument or prompt securely in ASCII
param(
    [string]$GitHubToken = ""
)

if ($GitHubToken -and $GitHubToken.Trim() -ne "") {
    Write-Host "Authenticating with provided Personal Access Token..." -ForegroundColor Green
    $authedRemote = "https://$($GitHubToken.Trim())@github.com/userfn-git/FN-MasterEngine-RL.git"
    git push -u $authedRemote main -f
} else {
    try {
        git push -u origin main
    } catch {
        Write-Host ""
        Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
        Write-Host "To push using your GitHub Token directly, run:" -ForegroundColor Cyan
        Write-Host '.\git-init-fix.ps1 -GitHubToken "YOUR_GITHUB_TOKEN_HERE"' -ForegroundColor White
        Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   SUCCESS: Repository synced and tracking branch set!    " -ForegroundColor Green
    Write-Host "   URL: https://github.com/userfn-git/FN-MasterEngine-RL  " -ForegroundColor Yellow
    Write-Host "==========================================================" -ForegroundColor Cyan
}
