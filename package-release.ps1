$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$manifestPath = Join-Path $projectRoot "manifest.json"
$manifest = Get-Content -Raw $manifestPath | ConvertFrom-Json
$distDirectory = Join-Path $projectRoot "dist"
$archivePath = Join-Path $distDirectory "savaktija-$($manifest.version).zip"

if (Test-Path $archivePath) {
  throw "Release archive already exists: $archivePath"
}

New-Item -ItemType Directory -Path $distDirectory -Force | Out-Null
$files = @(
  [pscustomobject]@{ Path = $manifestPath; EntryName = "manifest.json" },
  [pscustomobject]@{ Path = (Join-Path $projectRoot "savaktija.js"); EntryName = "savaktija.js" },
  [pscustomobject]@{ Path = (Join-Path $projectRoot "css\savaktija.css"); EntryName = "css/savaktija.css" },
  [pscustomobject]@{ Path = (Join-Path $projectRoot "icons\icon-16.png"); EntryName = "icons/icon-16.png" },
  [pscustomobject]@{ Path = (Join-Path $projectRoot "icons\icon-48.png"); EntryName = "icons/icon-48.png" },
  [pscustomobject]@{ Path = (Join-Path $projectRoot "icons\icon-128.png"); EntryName = "icons/icon-128.png" }
)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = $null
try {
  $archive = [System.IO.Compression.ZipFile]::Open(
    $archivePath,
    [System.IO.Compression.ZipArchiveMode]::Create
  )
  foreach ($file in $files) {
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $archive,
      $file.Path,
      $file.EntryName,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
}
catch {
  if ($archive) {
    $archive.Dispose()
  }
  if (Test-Path $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
  }
  throw
}
finally {
  if ($archive) {
    $archive.Dispose()
  }
}

Write-Output "Created $archivePath"
