param(
 [ValidateSet('doctor','launch','inspect','calibrate','input','run','smoke','stop')][string]$Command='doctor',
 [string]$RequestFile=''
)
$ErrorActionPreference='Stop'
Set-StrictMode -Version Latest
$repoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$localRoot=Join-Path $repoRoot 'research/.local-reference'
$captureRoot=Join-Path $repoRoot 'research/.captures'
$sessionPath=Join-Path $localRoot 'session.json'
$abortPath=Join-Path $localRoot 'ABORT'
$swfPath=Join-Path $localRoot 'reference.swf'
$swfHash='ede221ad99e031732a049409278ce45bc1602706045b95ab83756e72af8f23a7'
function Local-Path([string]$relativePath,[string]$allowedRoot) {
 $full=[IO.Path]::GetFullPath((Join-Path $repoRoot $relativePath))
 if(!$full.StartsWith($allowedRoot+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Path outside allowed research directory'}
 $cursor=$full
 while($cursor.Length -gt $repoRoot.Length){if(Test-Path -LiteralPath $cursor){if((Get-Item -LiteralPath $cursor).Attributes -band [IO.FileAttributes]::ReparsePoint){throw 'Research symlinks/junctions forbidden'}};$cursor=[IO.Path]::GetDirectoryName($cursor)}
 return $full
}
function Check-Swf {
 $checkedPath=Local-Path 'research/.local-reference/reference.swf' $localRoot
 if(!(Test-Path -LiteralPath $checkedPath) -or (Get-Item -LiteralPath $swfPath).Length -ne 693558 -or (Get-FileHash -LiteralPath $swfPath -Algorithm SHA256).Hash.ToLowerInvariant() -ne $swfHash){throw 'Exact SWF hash/size required; no input'}
}
function Runtime {
 Check-Swf
 $runtime=Get-Content -LiteralPath (Join-Path $localRoot 'runtime.json') -Raw | ConvertFrom-Json -DateKind String
 $exe=Local-Path $runtime.executable $localRoot
 if(!(Test-Path -LiteralPath $exe) -or $runtime.executableSha256 -notmatch '^[a-f0-9]{64}$' -or (Get-FileHash -LiteralPath $exe -Algorithm SHA256).Hash.ToLowerInvariant() -ne $runtime.executableSha256){throw 'Pinned Ruffle executable hash required; no input'}
 if($runtime.version -notmatch '\S' -or $runtime.environmentId -notmatch '^ia-therightmix-ede221ad99e03173__ruffle-desktop-'){throw 'Pinned runtime version/environment required'}
 return @{Data=$runtime;Exe=$exe}
}
function Session {
 $rt=Runtime
 $session=Get-Content -LiteralPath $sessionPath -Raw | ConvertFrom-Json -DateKind String
 $process=Get-Process -Id $session.processId
 if($process.HasExited -or $process.StartTime.ToUniversalTime().ToString('o') -ne $session.processStartedAt -or ![string]::Equals($process.Path,$rt.Exe,[StringComparison]::OrdinalIgnoreCase) -or $session.environmentId -ne $rt.Data.environmentId){throw 'Session process identity changed; no input'}
 return @{Runtime=$rt;Data=$session;Process=$process}
}
function Geometry($session,[bool]$requireForeground=$true) {
 [ReferenceNative]::Read($session.Data.windowHandle,$session.Data.processId,$session.Data.windowTitle,$requireForeground)
}
function Activate($session) {
 [ReferenceNative]::Activate($session.Data.windowHandle,$session.Data.processId,$session.Data.windowTitle,$abortPath)
}
function Capture($session,[string]$name) {
 $path=Local-Path ('research/.captures/'+$session.Data.sessionId+'/'+$name+'.png') $captureRoot
 [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($path)) | Out-Null
 $captureDpi=[ReferenceNative]::BeginDpi()
 try {
 [ReferenceNative]::Capture($session.Data.windowHandle,$session.Data.processId,$session.Data.windowTitle,$abortPath,$path) | Out-Null
 $g=Geometry $session
 Start-Sleep -Milliseconds 250
 $stable=Geometry $session
 if($g.X -ne $stable.X -or $g.Y -ne $stable.Y -or $g.Width -ne $stable.Width -or $g.Height -ne $stable.Height -or $g.Dpi -ne $stable.Dpi){throw 'Target geometry still settling; no input'}
 $bitmap=[Drawing.Bitmap]::new($g.Width,$g.Height)
 $graphics=[Drawing.Graphics]::FromImage($bitmap)
 try {
  $graphics.CopyFromScreen($g.X,$g.Y,0,0,[Drawing.Size]::new($g.Width,$g.Height))
  $after=Geometry $session
  if($g.X -ne $after.X -or $g.Y -ne $after.Y -or $g.Width -ne $after.Width -or $g.Height -ne $after.Height){throw ('Geometry changed during capture: before='+$g.X+','+$g.Y+','+$g.Width+','+$g.Height+' after='+$after.X+','+$after.Y+','+$after.Width+','+$after.Height)}
  $bitmap.Save($path,[Drawing.Imaging.ImageFormat]::Png)
 } finally {$graphics.Dispose();$bitmap.Dispose()}
 return $path.Substring($repoRoot.Length+1).Replace('\','/')
 } finally { [ReferenceNative]::EndDpi($captureDpi) }
}
function Fingerprint([string]$relativeCapture){
 $path=Local-Path $relativeCapture $captureRoot
 $bitmap=[Drawing.Bitmap]::new($path)
 try{if($bitmap.Width -ne 600 -or $bitmap.Height -ne 470){throw 'Cold fingerprint requires calibrated 600x470 client'};$bytes=[byte[]]::new(360*90*4);$n=0;for($y=130;$y -lt 220;$y++){for($x=120;$x -lt 480;$x++){$pixel=$bitmap.GetPixel($x,$y);$bytes[$n++]=$pixel.R;$bytes[$n++]=$pixel.G;$bytes[$n++]=$pixel.B;$bytes[$n++]=$pixel.A}};return [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($bytes)).ToLowerInvariant()}finally{$bitmap.Dispose()}
}
function Targets($session) {
 $map=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'targets.json') -Raw | ConvertFrom-Json -DateKind String
 if($map.status -ne 'VISUALLY_CALIBRATED' -or $map.environmentId -ne $session.Data.environmentId){throw 'Visual stage calibration required; no pointer input'}
 $g=Geometry $session
 $s=$map.stage
 if($s.width -le 0 -or $s.height -le 0 -or $s.insetTop -lt 0 -or $s.insetBottom -lt 0){throw 'Invalid stage'}
 $baseDpi=$g.Dpi;if($null -ne $s.PSObject.Properties['insetBaseDpi']){$baseDpi=$s.insetBaseDpi};if($baseDpi -le 0){throw 'Invalid inset DPI'}
 $topInset=$s.insetTop*$g.Dpi/$baseDpi;$bottomInset=$s.insetBottom*$g.Dpi/$baseDpi
 $availHeight=$g.Height-$topInset-$bottomInset
 $scale=[Math]::Min($g.Width/$s.width,$availHeight/$s.height)
 if($scale -le 0){throw 'Invalid stage scaling'}
 return @{Map=$map;Geometry=$g;Scale=$scale;Left=($g.Width-$s.width*$scale)/2;Top=$topInset+($availHeight-$s.height*$scale)/2}
}
function Gesture($session,$action,[string]$ordinal) {
 # No activation here: loss of foreground between actions aborts the sequence.
 $m=Targets $session
 $target=$m.Map.targets.PSObject.Properties[$action.target]
 if($null -eq $target){throw 'Unknown semantic target'}
 $p=$target.Value
 $clientSpace=($null -ne $p.PSObject.Properties['space'] -and $p.space -eq 'client')
 if($p.x -lt 0 -or $p.y -lt 0 -or (!$clientSpace -and ($p.x -ge $m.Map.stage.width -or $p.y -ge $m.Map.stage.height))){throw 'Stage coordinate out of bounds'}
 $duration=$action.holdMs
 if($duration -isnot [int] -and $duration -isnot [long]){throw 'Integer requested hold required'}
 if($duration -lt 0 -or $duration -gt 15000){throw 'Requested hold outside range'}
 $x=[int][Math]::Round($m.Left+$p.x*$m.Scale)
 $y=[int][Math]::Round($m.Top+$p.y*$m.Scale)
 if($null -ne $p.PSObject.Properties['space'] -and $p.space -eq 'client'){$x=[int]$p.x;$y=[int]$p.y}
 $before=Capture $session ($ordinal+'-before')
 $script:duringPath=$null
 $duringCallback=$null
 if($null -ne $action.PSObject.Properties['captureDuring'] -and $action.captureDuring){$duringCallback=[Action]{ $script:duringPath=Capture $session ($ordinal+'-during') }}
 $script:activeGesture=@{target=$action.target;requestedHoldMs=$duration;geometry=$m.Geometry;stage=@{x=$p.x;y=$p.y};client=@{x=$x;y=$y};stageScale=$m.Scale;captures=@($before)}
 try { $timing=[ReferenceNative]::Hold($session.Data.windowHandle,$session.Data.processId,$session.Data.windowTitle,$x,$y,[int]$duration,$abortPath,$duringCallback) } catch {$script:activeGesture.timing=[ReferenceNative]::LastTiming;$script:activeGesture.captures=@($before,$script:duringPath) | Where-Object { $_ };throw}
 $script:activeGesture=$null
 Start-Sleep -Milliseconds 500
 $after=Capture $session ($ordinal+'-after')
 return @{target=$action.target;requestedHoldMs=$duration;measuredHoldMs=$timing.MeasuredHoldMs;downMs=$timing.DownMs;upMs=$timing.UpMs;client=@{x=$x;y=$y};stage=@{x=$p.x;y=$p.y};screen=@{x=$timing.ScreenX;y=$timing.ScreenY};geometry=$m.Geometry;stageScale=$m.Scale;captures=@($before,$script:duringPath,$after) | Where-Object { $_ };method='Win32 SendInput / SetCursorPos';released=$timing.Released;buttonDownObserved=$timing.ButtonDownObserved;buttonUpObserved=$timing.ButtonUpObserved;physicalCursor=@{x=$timing.PhysicalCursorX;y=$timing.PhysicalCursorY}}
}
try {
 if(![Runtime.InteropServices.RuntimeInformation]::IsOSPlatform([Runtime.InteropServices.OSPlatform]::Windows)){throw 'Windows required'}
 Add-Type -Path (Join-Path $PSScriptRoot 'Win32.cs')
 Add-Type -AssemblyName System.Drawing
 if(![ReferenceNative]::DpiSupported()){throw 'Per-monitor DPI awareness unavailable'}
 if($Command -eq 'doctor'){
  $checks=@{windows=$true;nativeHelperLoaded=$true;perMonitorDpiSupported=$true;inputStructMethod='Win32 SendInput';screenCaptureApiLoaded=$true;inputSent=$false}
  $ignored=@(& git -C $repoRoot check-ignore research/.local-reference/reference.swf research/.local-reference/runtime.json research/.captures/probe.png)
  if($LASTEXITCODE -ne 0 -or $ignored.Count -ne 3){throw 'Research directories not Git-ignored'}
  $tracked=@(& git -C $repoRoot ls-files -- research/.local-reference research/.captures)
  if($tracked.Count -ne 0){throw 'Local reference files must not be tracked'}
  $checks.ignoredPaths=$true
  $rt=Runtime;$checks.exactSwf=$true;$checks.pinnedRuntime=$rt.Data
  if(Test-Path -LiteralPath $sessionPath){try{$session=Session}catch{$session=$null};if($null -ne $session){$checks.geometry=Geometry $session $false;if($checks.geometry.Foreground){$checks.capture=Capture $session ('doctor-'+[DateTime]::UtcNow.ToString('HHmmssfff'));$checks.targetScreenshotVerified=$true}}else{$checks.sessionState='READY_TO_LAUNCH';$checks.targetScreenshotVerified=$false}}
  $checks.passed=$true;$checks | ConvertTo-Json -Depth 15
 } elseif($Command -eq 'launch'){
  $rt=Runtime
  if(Test-Path -LiteralPath $sessionPath){try{$prior=Session}catch{$prior=$null};if($null -ne $prior){throw 'Previous owned Ruffle session still running: stop it before cold launch'}}
  if(Test-Path -LiteralPath $abortPath){throw 'ABORT sentinel present; explicitly remove it before launch'}
  # The visible foreground Ruffle game window is the interactive research target requested by the user.
  $process=Start-Process -FilePath $rt.Exe -ArgumentList @('--width','600','--height','440','--graphics','dx12','--storage','memory','--config',(Join-Path $localRoot 'config'),'--cache-directory',(Join-Path $localRoot 'cache'),'--open-url-mode','deny','--tcp-connections','deny','--filesystem-access-mode','deny',$swfPath) -WorkingDirectory $localRoot -PassThru
  $clock=[Diagnostics.Stopwatch]::StartNew()
  do {Start-Sleep -Milliseconds 200;$process.Refresh();if($process.HasExited){throw 'Ruffle exited before window appeared'}} while(($process.MainWindowHandle -eq 0 -or $process.MainWindowTitle -notmatch '^Ruffle.*reference\.swf') -and $clock.Elapsed.TotalSeconds -lt 15)
  if($process.MainWindowHandle -eq 0 -or $process.MainWindowTitle -notmatch '^Ruffle.*reference\.swf'){throw 'No expected Ruffle game window: no input'}
  $data=@{sessionId=('NATIVE-'+[DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfff')+'-'+$process.Id);processId=$process.Id;processStartedAt=$process.StartTime.ToUniversalTime().ToString('o');windowHandle=$process.MainWindowHandle.ToInt64();windowTitle=$process.MainWindowTitle;environmentId=$rt.Data.environmentId;swfSha256=$swfHash;coldLaunch=$true}
  $data | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $sessionPath -Encoding utf8
  $session=Session;Activate $session | Out-Null
  Start-Sleep -Milliseconds 1500
  $coldCapture=Capture $session 'cold-launch'
  @{session=$data;geometry=Geometry $session;capture=$coldCapture;coldStateFingerprint=Fingerprint $coldCapture;needsVisualInitialValidation=$true} | ConvertTo-Json -Depth 15
 } elseif($Command -eq 'stop'){
  $session=Session
  $session.Process.Kill();$session.Process.WaitForExit(5000) | Out-Null
  @{stoppedOwnedProcess=$session.Data.processId;sessionId=$session.Data.sessionId} | ConvertTo-Json
 } else {
  $session=Session
  if($Command -eq 'inspect' -or $Command -eq 'calibrate'){
   Activate $session | Out-Null
   @{session=$session.Data;geometry=Geometry $session;capture=Capture $session ('inspect-'+[DateTime]::UtcNow.ToString('HHmmssfff'));calibration='Visual stage bounds and semantic points must be reviewed before input'} | ConvertTo-Json -Depth 15
  } else {
   if(!$RequestFile){throw 'Repository-local request JSON required'}
   $requestPath=Local-Path $RequestFile $localRoot
   $request=Get-Content -LiteralPath $requestPath -Raw | ConvertFrom-Json -DateKind String
   if($request.sessionId -ne $session.Data.sessionId -or $request.initialVisualConfirmed -ne $true){throw 'Current session and visual confirmation required'}
   if(!$request.actions -or $request.actions.Count -gt 30){throw '1..30 actions required'}
   Activate $session | Out-Null
   $trace=@();$n=0
   foreach($action in $request.actions){$n++;$trace+=Gesture $session $action ('action-'+[DateTime]::UtcNow.ToString('HHmmssfff')+'-'+$n)}
   $reactionCaptures=@();$captureGaps=@()
   if($null -ne $request.PSObject.Properties['afterServeWaitMs']){if($request.afterServeWaitMs -lt 0 -or $request.afterServeWaitMs -gt 30000){throw 'Invalid result wait'};for($waited=0;$waited -lt $request.afterServeWaitMs;$waited+=2000){Start-Sleep -Milliseconds ([Math]::Min(2000,$request.afterServeWaitMs-$waited));try{$reactionCaptures+=Capture $session ('reaction-'+[DateTime]::UtcNow.ToString('HHmmssfff'))}catch{$captureGaps+=@{dateTime=[DateTime]::UtcNow.ToString('o');reason=$_.Exception.Message}}}}
   $resultCapture=$null;try{$resultCapture=Capture $session ('result-'+[DateTime]::UtcNow.ToString('HHmmssfff'))}catch{$captureGaps+=@{dateTime=[DateTime]::UtcNow.ToString('o');reason=$_.Exception.Message}}
   $out=@{captureGaps=$captureGaps;reactionCaptures=$reactionCaptures;resultCapture=$resultCapture;session=$session.Data;runtime=$session.Runtime.Data;actions=$trace;flashDurationMeasured=$false;numericScoreReadAutomatically=$false}
   $path=Join-Path $localRoot ($session.Data.sessionId+'-trace-'+[DateTime]::UtcNow.ToString('HHmmssfff')+'.json')
   $out | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $path -Encoding utf8
   $out | ConvertTo-Json -Depth 20
  }
 }
} catch {
 $failure=@{passed=$false;command=$Command;reason=$_.Exception.Message;inputStopped=$true}
 if((Get-Variable -Name session -ErrorAction SilentlyContinue) -and $null -ne $session -and $session.ContainsKey('Data')){
  $failure.session=$session.Data;$failure.runtime=$session.Runtime.Data
  $failure.actions=@();if(Get-Variable -Name trace -ErrorAction SilentlyContinue){$failure.actions=@($trace)}
  if(Get-Variable -Name activeGesture -Scope Script -ErrorAction SilentlyContinue){$failure.abortedAction=$script:activeGesture}
  $failure | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $localRoot ($session.Data.sessionId+'-abort-'+[DateTime]::UtcNow.ToString('HHmmssfff')+'.json')) -Encoding utf8
 }
 $failure | ConvertTo-Json -Depth 20
 exit 1
}
