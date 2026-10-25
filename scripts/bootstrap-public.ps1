# Run from a Windows PowerShell terminal inside extracted LatencyLens folder.
# Prerequisites: git, Node.js 22+, npm, gh CLI authenticated (`gh auth login`).
param(
  [string]$Owner = "Roojool",
  [string]$Repo = "LatencyLens",
  [string[]]$Teammates = @()
)
$ErrorActionPreference = 'Stop'
function Run([string]$command) { Write-Host "--> $command" -ForegroundColor Cyan; Invoke-Expression $command; if ($LASTEXITCODE -ne 0) { throw "Failed: $command" } }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {throw 'GitHub CLI (gh) not installed; install from https://cli.github.com/'}
Run 'gh auth status'
Run 'npm install --no-audit --no-fund'
if (-not (Test-Path .git)) {Run 'git init -b main'}
Run 'git add .'
Run 'git commit -m "chore: initialize LatencyLens Hack Day starter"'
Run "gh repo create $Owner/$Repo --public --source . --remote origin --push --description 'LatencyLens: AI network diagnostics with Gemma 4, Temporal and Kepler'"
Run "gh api --method PATCH repos/$Owner/$Repo -F allow_auto_merge=true -F allow_squash_merge=true -F delete_branch_on_merge=true"
# Must protect main before auto-merge; otherwise PR can merge before CI.
$rules = @{
  required_status_checks=@{strict=$true;contexts=@('checks')}
  enforce_admins=$true
  required_pull_request_reviews=$null
  restrictions=$null
  required_linear_history=$true
  allow_force_pushes=$false
  allow_deletions=$false
  required_conversation_resolution=$false
} | ConvertTo-Json -Depth 10
$tmp = [IO.Path]::GetTempFileName()
[IO.File]::WriteAllText($tmp,$rules,(New-Object System.Text.UTF8Encoding($false)))
try {Run "gh api --method PUT repos/$Owner/$Repo/branches/main/protection --input `"$tmp`""} finally {Remove-Item $tmp -Force -ErrorAction SilentlyContinue}
foreach($name in $Teammates) {
  if ($name -and $name -ne $Owner) { Run "gh api --method PUT repos/$Owner/$Repo/collaborators/$name -f permission=push" }
}
Write-Host "Public repository created: https://github.com/$Owner/$Repo" -ForegroundColor Green
Write-Host 'Invitees must ACCEPT their GitHub collaboration invitations. CI auto-merge only applies to trusted same-repo feat/* PRs after all checks pass. Changes to repo/config/security files need manual merging.'
