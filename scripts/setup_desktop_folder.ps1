$ErrorActionPreference = "Stop"

# Get Desktop path
$desktop = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$desktopDir = Join-Path $desktop "AICTE Regulatory Platform"
$hackDir = "C:\hackthons\Launch_Platform"

# Create directories
if (-not (Test-Path $desktopDir)) {
    New-Item -ItemType Directory -Path $desktopDir -Force | Out-Null
}
if (-not (Test-Path $hackDir)) {
    New-Item -ItemType Directory -Path $hackDir -Force | Out-Null
}

Write-Host "Created Desktop folder: $desktopDir"
Write-Host "Created Hackthons folder: $hackDir"
