param([Parameter(Mandatory)][string[]]$Ids,[Parameter(Mandatory)][string]$Output)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$root=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$capRoot=[IO.Path]::GetFullPath((Join-Path $root 'research/.captures'))+[IO.Path]::DirectorySeparatorChar
$out=[IO.Path]::GetFullPath((Join-Path $root $Output))
if(!$out.StartsWith($capRoot,[StringComparison]::OrdinalIgnoreCase)){throw 'Ignored research output required'}
$b=[Drawing.Bitmap]::new(1000,230*$Ids.Length);$g=[Drawing.Graphics]::FromImage($b);$g.Clear([Drawing.Color]::White)
$f=[Drawing.Font]::new('Arial',11)
try {
 for($row=0;$row -lt $Ids.Length;$row++){
  $id=$Ids[$row];if($id -notmatch '^IA-1E-[A-Za-z0-9_-]+$'){throw 'Invalid ID'}
  $r=Get-Content -LiteralPath (Join-Path $root ('research/phase1e/runs/'+$id+'.json')) -Raw | ConvertFrom-Json
  $g.DrawString($id,$f,[Drawing.Brushes]::Black,0,230*$row)
  $files=@($r.resultCapture,$r.fullIndicatorCapture,$r.reactionCaptures[5])
  $sourceRects=@([Drawing.Rectangle]::new(20,130,560,155),[Drawing.Rectangle]::new(414,386,182,80),[Drawing.Rectangle]::new(400,70,200,280))
  $destRects=@([Drawing.Rectangle]::new(0,30+230*$row,560,155),[Drawing.Rectangle]::new(570,30+230*$row,182,80),[Drawing.Rectangle]::new(770,30+230*$row,130,182))
  for($i=0;$i -lt 3;$i++){
   $p=[IO.Path]::GetFullPath((Join-Path $root $files[$i]));if(!$p.StartsWith($capRoot,[StringComparison]::OrdinalIgnoreCase)){throw 'Original runner capture required'}
   $im=[Drawing.Image]::FromFile($p)
   try{$g.DrawImage($im,$destRects[$i],$sourceRects[$i],[Drawing.GraphicsUnit]::Pixel)}finally{$im.Dispose()}
  }
 }
 $b.Save($out,[Drawing.Imaging.ImageFormat]::Png)
}finally{$f.Dispose();$g.Dispose();$b.Dispose()}
Write-Output $out

