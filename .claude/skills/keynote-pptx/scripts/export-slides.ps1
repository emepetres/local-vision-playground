<#
.SYNOPSIS
  Export every slide of a .pptx to PNG through PowerPoint, plus a contact sheet.

.DESCRIPTION
  Stands in for LibreOffice + pdftoppm, which the anthropic-skills:pptx QA steps
  assume: PowerPoint renders the deck exactly as the speaker will see it, fonts
  included. Writes slide-NN.png and grid.png into OutDir, replacing what was there.
  Needs Windows with PowerPoint installed; exits 2 when it is not.

.EXAMPLE
  pwsh -File export-slides.ps1 -Pptx deck.pptx -OutDir $env:TEMP\deck-render
#>
param(
    [Parameter(Mandatory)] [string] $Pptx,
    [Parameter(Mandatory)] [string] $OutDir,
    [int] $Width = 1280,
    [int] $Columns = 5
)

$ErrorActionPreference = 'Stop'
$Pptx = (Resolve-Path $Pptx).Path
if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
New-Item -ItemType Directory -Force $OutDir | Out-Null
$OutDir = (Resolve-Path $OutDir).Path

try { $app = New-Object -ComObject PowerPoint.Application }
catch { Write-Error "PowerPoint is not available: $_"; exit 2 }

$height = [int]($Width * 9 / 16)
$files = @()
try {
    # ReadOnly, Untitled = false, WithWindow = false
    $pres = $app.Presentations.Open($Pptx, $true, $false, $false)
    $i = 0
    foreach ($slide in $pres.Slides) {
        $i++
        $file = Join-Path $OutDir ('slide-{0:D2}.png' -f $i)
        $slide.Export($file, 'PNG', $Width, $height)
        $files += $file
    }
    $pres.Close()
}
finally {
    if ($app.Presentations.Count -eq 0) { $app.Quit() }
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}

# Contact sheet, each tile labelled with its slide number.
Add-Type -AssemblyName System.Drawing
$tw = 384; $th = 216; $rows = [math]::Ceiling($files.Count / $Columns)
$grid = New-Object System.Drawing.Bitmap ($Columns * $tw), ($rows * $th)
$g = [System.Drawing.Graphics]::FromImage($grid)
$g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font 'Segoe UI', 14, ([System.Drawing.FontStyle]::Bold)
for ($n = 0; $n -lt $files.Count; $n++) {
    $img = [System.Drawing.Image]::FromFile($files[$n])
    $x = ($n % $Columns) * $tw; $y = [math]::Floor($n / $Columns) * $th
    $g.DrawImage($img, $x + 2, $y + 2, $tw - 4, $th - 4)
    $g.FillRectangle([System.Drawing.Brushes]::Black, $x + 2, $y + 2, 40, 26)
    $g.DrawString(($n + 1).ToString(), $font, [System.Drawing.Brushes]::White, $x + 5, $y + 3)
    $img.Dispose()
}
$g.Dispose()
$gridFile = Join-Path $OutDir 'grid.png'
$grid.Save($gridFile, [System.Drawing.Imaging.ImageFormat]::Png)
$grid.Dispose()

$files + $gridFile | ForEach-Object { $_ }
