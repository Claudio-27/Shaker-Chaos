param([Parameter(Mandatory)][string[]]$Ids,[string]$Output='research/.captures/phase1d-review.png')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$outPath=[IO.Path]::GetFullPath((Join-Path $root $Output))
$capRoot=[IO.Path]::GetFullPath((Join-Path $root 'research/.captures'))+[IO.Path]::DirectorySeparatorChar
if(!$outPath.StartsWith($capRoot,[StringComparison]::OrdinalIgnoreCase)){throw 'Research capture output required'}
$bitmap=[Drawing.Bitmap]::new(1800,500*$Ids.Length)
$g=[Drawing.Graphics]::FromImage($bitmap);$g.Clear([Drawing.Color]::White)
$font=[Drawing.Font]::new('Arial',12)
try {
 for($row=0;$row -lt $Ids.Length;$row++){
  $id=$Ids[$row];if($id -notmatch '^IA-1D-[A-Za-z0-9_-]+$'){throw 'Invalid run ID'}
  $run=Get-Content -LiteralPath (Join-Path $root ('research/phase1d/runs/'+$id+'.json')) -Raw | ConvertFrom-Json
  $reaction=if($run.reactionCaptures.Count -gt 5){$run.reactionCaptures[5]}else{$null}
  $files=@($run.resultCapture,$run.fullIndicatorCapture,$reaction)
  $g.DrawString(($id+' | RESULT / POUR / REACTION SAMPLE'),$font,[Drawing.Brushes]::Black,0,500*$row)
  for($col=0;$col -lt 3;$col++){
   if(!$files[$col]){continue}
   $file=[IO.Path]::GetFullPath((Join-Path $root $files[$col]))
   if(!$file.StartsWith($capRoot,[StringComparison]::OrdinalIgnoreCase)){throw 'Only local research captures allowed'}
   $source=[Drawing.Image]::FromFile($file)
   try{$g.DrawImage($source,[Drawing.Rectangle]::new(600*$col,30+500*$row,$source.Width,$source.Height))}finally{$source.Dispose()}
  }
 }
 $bitmap.Save($outPath,[Drawing.Imaging.ImageFormat]::Png)
} finally {$font.Dispose();$g.Dispose();$bitmap.Dispose()}
Write-Output $outPath
