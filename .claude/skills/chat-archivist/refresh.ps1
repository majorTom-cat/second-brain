# refresh.ps1 - periodic auto-refresh (called by Windows Scheduled Task). Zero tokens; local node + git only.
#   1) node ingest.mjs auto   (only auto_push:true projects = company data excluded)
#   2) if residual secrets remain after masking -> abort push (human must review).
#   3) stage only auto_push project paths + archive/INDEX.md -> commit & push if changed.
# Knowledge distillation is a judgment step and is NOT done here. Use -DryRun to check without commit/push.
#
# Usage:  powershell -NoProfile -ExecutionPolicy Bypass -File refresh.ps1 [-DryRun]
# (ASCII-only on purpose: Windows PowerShell 5.1 misreads UTF-8-without-BOM scripts.)
param([switch]$DryRun)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path
Set-Location $repo
$log = Join-Path $repo 'archive\.refresh.log'
function Log($m) {
  $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $m"
  Add-Content -Path $log -Value $line -Encoding utf8
  Write-Host $line
}

$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { $node = 'C:\Program Files\nodejs\node.exe' }

Log "-- refresh start (DryRun=$DryRun) --"
$stdout = & $node '.claude/skills/chat-archivist/ingest.mjs' auto
$jsonLine = $stdout | Where-Object { $_ -match '^\{.*\}$' } | Select-Object -Last 1
if (-not $jsonLine) { Log "ERROR: no ingest summary JSON. abort."; exit 1 }
$data = $jsonLine | ConvertFrom-Json

if ($data.anyResidualSecret) {
  Log "ABORT: residual secret found after masking. Review chats/SECRETS.md and handle manually. (no push)"
  exit 1
}

$autoPaths = @()
foreach ($p in $data.projects) { if ($p.autoPush) { $autoPaths += "archive/$($p.project)" } }
if ($autoPaths.Count -eq 0) { Log "no auto_push project - nothing to do."; exit 0 }
$stale = ($data.projects | Where-Object { $_.newSinceDistill -gt 0 } | ForEach-Object { $_.project }) -join ', '
if ($stale) { Log "note: re-distill suggested for = $stale (knowledge update is manual)." }

$paths = $autoPaths + @('archive/INDEX.md')
if ($DryRun) {
  Log "[dry-run] would stage: $($paths -join ', ')"
  & git add --dry-run -- $paths 2>&1 | ForEach-Object { Log "[dry] $_" }
  Log "[dry-run] done (no commit/push)."
  exit 0
}

& git add -- $paths
& git diff --cached --quiet
if ($LASTEXITCODE -eq 0) { Log "no changes - skip commit."; exit 0 }

$msg = "chore(archive): periodic auto-refresh $(Get-Date -Format 'yyyy-MM-dd HH:mm') (auto_push projects)"
& git commit -m $msg -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
if ($LASTEXITCODE -ne 0) { Log "ERROR: commit failed."; exit 1 }
& git push origin main
if ($LASTEXITCODE -ne 0) { Log "ERROR: push failed (check credentials/network). commit is local."; exit 1 }
Log "OK committed & pushed: $msg"
