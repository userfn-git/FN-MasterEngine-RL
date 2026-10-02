<#
==============================================================================
FN ROCKET LEAGUE MASTER-ENGINE: GIT REPOSITORY CONFIGURATION & PUSH AUTOMATION
File: git-init-fix.ps1
Target Repository: https://github.com/userfn-git/FN-MasterEngine-RL.git
Encoding: Strict 100% ASCII Only (Zero Unicode / No Non-English Characters)
==============================================================================
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$GitHubToken = ""
)

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
$OutputEncoding = [System.Text.Encoding]::UTF8
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

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

# 1. Clean stale Git index locks and reset environment variables
Write-Host "[1/5] Resetting Git credential prompts and cleaning stale locks..." -ForegroundColor Yellow

$gitLock = Join-Path $projectRoot ".git\index.lock"
if (Test-Path $gitLock) {
    Remove-Item -Path $gitLock -Force -ErrorAction SilentlyContinue
    Write-Host "      Removed stale lock file: $gitLock" -ForegroundColor DarkGray
}

Remove-Item Env:\GIT_ASKPASS -ErrorAction SilentlyContinue
Remove-Item Env:\SSH_ASKPASS -ErrorAction SilentlyContinue

# 2. Configure Windows Credential Manager and default branch
git config --global credential.helper manager
git config --global init.defaultBranch main

# 3. Initialize Git repository if needed
if (-not (Test-Path "$projectRoot\.git")) {
    Write-Host "[2/5] Initializing local Git repository..." -ForegroundColor Yellow
    git init
} else {
    Write-Host "[2/5] Git repository already initialized." -ForegroundColor Green
}

# 4. Set remote origin
Write-Host "[3/5] Setting remote origin URL..." -ForegroundColor Yellow
$targetRemote = "https://github.com/userfn-git/FN-MasterEngine-RL.git"

git remote remove origin 2>$null
git remote add origin $targetRemote
Write-Host "[OK] Remote origin set to: $targetRemote" -ForegroundColor Green

# 5. Set branch name to main
Write-Host "[4/5] Setting active branch to main..." -ForegroundColor Yellow
git branch -M main

# 6. Stage and commit uncommitted files
Write-Host "[5/5] Staging files and creating commit..." -ForegroundColor Yellow
git add .
$commitStatus = git status --porcelain
if ($commitStatus) {
    git commit -m "feat: synchronize master engine standalone release and sqlite database"
    Write-Host "[OK] Changes committed to main." -ForegroundColor Green
} else {
    Write-Host "[OK] Working tree clean; ready for sync." -ForegroundColor Green
}

# 7. Push to GitHub with upstream tracking
Write-Host "Synchronizing with origin/main..." -ForegroundColor Yellow

if ($GitHubToken -and $GitHubToken.Trim() -ne "") {
    Write-Host "Authenticating with provided Personal Access Token..." -ForegroundColor Green
    $cleanToken = $GitHubToken.Trim()
    $authedRemote = "https://$cleanToken@github.com/userfn-git/FN-MasterEngine-RL.git"
    git push -u $authedRemote main -f
} else {
    try {
        git push -u origin main
    } catch {
        Write-Host ""
        Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
        Write-Host "To push using your GitHub Token directly, execute:" -ForegroundColor Cyan
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
