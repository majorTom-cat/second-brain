# schedule-setup.ps1 - register/remove refresh.ps1 as a Windows Scheduled Task (current user, no admin).
# Runs only while the computer is on and the user is logged in. Zero tokens (local node + git).
#
# Register (default weekly Sun 21:00):  powershell -NoProfile -ExecutionPolicy Bypass -File schedule-setup.ps1
# Daily instead:                         ...schedule-setup.ps1 -Schedule DAILY -Time 21:00
# Remove:                                ...schedule-setup.ps1 -Remove
# (ASCII-only on purpose: Windows PowerShell 5.1 misreads UTF-8-without-BOM scripts.)
param(
  [ValidateSet('DAILY','WEEKLY')][string]$Schedule = 'WEEKLY',
  [string]$Day = 'SUN',
  [string]$Time = '21:00',
  [switch]$Remove
)
$ErrorActionPreference = 'Stop'
$name = 'second-brain archive refresh'

if ($Remove) {
  schtasks /Delete /TN $name /F
  Write-Host "removed: '$name'"
  return
}

$ps1 = Join-Path $PSScriptRoot 'refresh.ps1'
$tr = "powershell -NoProfile -ExecutionPolicy Bypass -File `"$ps1`""
if ($Schedule -eq 'WEEKLY') {
  schtasks /Create /TN $name /TR $tr /SC WEEKLY /D $Day /ST $Time /F
} else {
  schtasks /Create /TN $name /TR $tr /SC DAILY /ST $Time /F
}
Write-Host ""
Write-Host "registered: '$name' - $Schedule $(if($Schedule -eq 'WEEKLY'){$Day}) $Time"
Write-Host "  action: refresh.ps1 (refresh personal projects -> commit -> push; company data excluded; abort on residual secret)"
Write-Host "  test now: powershell -NoProfile -ExecutionPolicy Bypass -File `"$ps1`" -DryRun"
Write-Host "  remove:   powershell -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -Remove"
