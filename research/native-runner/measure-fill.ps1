param([Parameter(Mandatory)][string]$Capture)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$path=[IO.Path]::GetFullPath((Join-Path $root $Capture))
$capRoot=[IO.Path]::GetFullPath((Join-Path $root 'research/.captures'))+[IO.Path]::DirectorySeparatorChar
if(!$path.StartsWith($capRoot,[StringComparison]::OrdinalIgnoreCase)){throw 'Runner screenshots only'}
$b=[Drawing.Bitmap]::new($path)
try {
 if($b.Width -ne 600 -or $b.Height -ne 470){throw 'Calibrated client geometry required'}
 $rows=@()
 for($y=407;$y -le 444;$y++){
  $red=0
  for($x=442;$x -le 455;$x++){$p=$b.GetPixel($x,$y);if((($p.R -lt 65 -and $p.G -lt 65 -and $p.B -lt 65) -or ($p.R -ge 30 -and $p.R -gt 1.4*$p.G -and $p.R -gt 1.4*$p.B))){$red++}}
  if($red -ge 8){$rows+=$y}
 }
 @{method='visible-gauge-height-v1';capture=$Capture;roi=@{left=442;right=455;top=407;bottom=444};heightPixels=$rows.Count;maxHeightPixels=38;detectedRows=$rows;canonicalUnitMapping='UNMAPPED';meaning='Dark/red gauge pixel rows in fixed ROI, not internal volume. Valid only when gauge visibly displayed. During capture is intermediate, not final fill.'} | ConvertTo-Json -Depth 5
} finally {$b.Dispose()}

