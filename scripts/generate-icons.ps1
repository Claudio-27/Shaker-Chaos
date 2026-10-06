# Original geometric PWA icons. Optional regeneration on Windows; not a build dependency.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$taskRoot = Split-Path -Parent $PSScriptRoot
foreach ($size in @(192, 512)) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.ScaleTransform($size / 512.0, $size / 512.0)
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#143b37'))
  $gold = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#dfb575'), 24)
  $gold.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $gold.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  foreach ($line in @(@(256,100,256,143), @(256,369,256,412), @(100,256,143,256), @(369,256,412,256), @(145,145,176,176), @(336,336,367,367), @(145,367,176,336), @(336,176,367,145))) {
    $graphics.DrawLine($gold, $line[0], $line[1], $line[2], $line[3])
  }
  $cream = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#f6f3eb'))
  $amber = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#dfa857'))
  $mint = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#b8d0b1'))
  $outer = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(191,199), [System.Drawing.PointF]::new(321,199), [System.Drawing.PointF]::new(303,359), [System.Drawing.PointF]::new(209,359))
  $inner = [System.Drawing.PointF[]]@([System.Drawing.PointF]::new(202,241), [System.Drawing.PointF]::new(310,241), [System.Drawing.PointF]::new(297,346), [System.Drawing.PointF]::new(215,346))
  $graphics.FillPolygon($cream, $outer)
  $graphics.FillPolygon($amber, $inner)
  $graphics.FillRectangle($mint, 208,160,96,32)
  $bitmap.Save((Join-Path $taskRoot "public/icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $gold.Dispose(); $cream.Dispose(); $amber.Dispose(); $mint.Dispose()
  $graphics.Dispose(); $bitmap.Dispose()
}
