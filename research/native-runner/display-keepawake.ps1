param([int]$Minutes=70)
$ErrorActionPreference='Stop'
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$local=Join-Path $root 'research/.local-reference'
$stop=Join-Path $local 'display-keepawake.stop'
$status=Join-Path $local 'display-keepawake-status.json'
Add-Type -TypeDefinition @"
using System.Runtime.InteropServices;
public static class ResearchDisplayAwake {
 [DllImport("kernel32.dll", SetLastError=true)] public static extern uint SetThreadExecutionState(uint flags);
}
"@
$clock=[Diagnostics.Stopwatch]::StartNew()
try {
 $previous=[ResearchDisplayAwake]::SetThreadExecutionState([uint32]2147483651)
 if($previous -eq 0){throw 'Display/system keep-awake request failed'}
 @{state='HELD';processId=$PID;startedUtc=[DateTime]::UtcNow.ToString('o');maxMinutes=$Minutes;settingsChanged=$false;api='SetThreadExecutionState ES_CONTINUOUS|ES_SYSTEM_REQUIRED|ES_DISPLAY_REQUIRED'} | ConvertTo-Json | Set-Content -LiteralPath $status -Encoding utf8
 while($clock.Elapsed.TotalMinutes -lt $Minutes -and !(Test-Path -LiteralPath $stop)){Start-Sleep -Seconds 2}
} finally {
 [ResearchDisplayAwake]::SetThreadExecutionState([uint32]2147483648) | Out-Null
 @{state='RELEASED';processId=$PID;endedUtc=[DateTime]::UtcNow.ToString('o');settingsChanged=$false} | ConvertTo-Json | Set-Content -LiteralPath $status -Encoding utf8
}
